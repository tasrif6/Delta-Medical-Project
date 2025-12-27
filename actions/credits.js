import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const PLAN_CREDITS = {
    free_plan: 0,
    standard_plan: 10,
    premium_plan: 24,
}
export async function CheckCredits(user) {
  try {
    if(!user) {
        return null;
    }

    if (user.role!=="PATIENT") {
        return user;
    }

    const { has } = await auth();
    
    //Check which plan the user has
    const hasBasic = has({plan: "free_plan"});
    const hasStandard = has({plan: "standard_plan"});
    const hasPremium = has({plan :"premium_plan"});

    let currentPlan = null;
    let credits = 0;

    if (hasPremium) {
        currentPlan = "premium_plan";
        credits= PLAN_CREDITS.premium_plan;
    } else if (hasStandard) {
        currentPlan = "standard_plan";
        credits= PLAN_CREDITS.standard_plan;
    } else if (hasBasic) {
        currentPlan = "free_plan";
        credits= PLAN_CREDITS.free_plan;
    }

    //if user doesn't have any plan just return the user
    if (!currentPlan) {
        return user;
    }

    //check if we already allocated credits for this month
    const currentMonth = format(new Date(), "yyyy-MM");

    //If there's a transaction this month, check if it's for the same plan
    if (user.transactions.length > 0) {
        const latestTransaction = user.transactions[0];
        const transactionMonth = format(
            new Date(latestTransaction.createdAt),
            "yyyy-MM"
        );
        const transactionPlan = latestTransaction.packageId;
        
        //if we already allocated credits for this month and the plan is the same, just return 
        if (transactionMonth === currentMonth && transactionPlan === currentPlan) {
            return user;
        }
    }

    //Allocate credits and create transaction record
    const updatedUser = await db.$transaction(async (tx) => {
        //create transaction record
        await tx.createTransaction.create({
            data: {
                userId: user.id,
                amount: creditsToAllocate,
                type: "CREDIT_PURCHASE",
                packageId: currentPlan,
            },
        });

        //update user's credit balance
        const updatedUser = await tx.user.update({
            where: {
                id: user.id,
            },
            data: {
                credits: {
                    increment: creditsToAllocate,
                },
            },
        });

        return updatedUser;
    });

    revalidatePath("/doctors");
    revalidatePath("/appointments")

    return updatedUser;

  } catch (error) {
    console.log("credits error",error.message);
        return null;
    }

}


export async function deductCreditsForAppointment(userId, doctorId) {
    try{
        const user = await db.user.findUnique({
            where: {id: userId },
        });

        const doctor = await db.user.findUnique({
            where: {id: doctorId},
        });

        //ensuring users have suficient credits
        if(user.credits <Appointment_CREDIT_COST) {
            throw new Error("Insufficient credits to book an appointment");
        }

        if(!doctor) {
            throw new Error("Doctor not found");
        }

        //Deduct credits from patient and add to doctor
        const result = await db.$transaction(async (tx) => {
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: -APPOINTMENT_CREDIT_COST,
                    type: "APPOINTMENT_DEDUCTION",
                },
            });

        //create transaction record for doctor(addition)
        await tx.creditTransaction.creat({
            data: {
                userId: doctor.id,
                amount: APPOINTMENT_CREDIT_COST,
                type: "APPOINTMENT_DEDUCTION",
            },
        });

        //Update Patients credit balance (decrement)
        const updatedUser = await tx.user.update({
            where: {
                id: user.id,
            },
            data: {
                credits: {
                    increment: APPOINTMENT_CREDIT_COST,
                },
            },
        });
        await tx.user.update({
            where: {
                id: doctor.id,
            },
            data: {
                credits: {
                    increment: APPOINTMENT_CREDIT_COST,
                    },
                },
            });
        return updatedUser;
        });

        return {success: true, user: result };
    } catch (error) {
        console.log(error)
        return {success: false, error: error.message}
    }
}
