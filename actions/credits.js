"use server";
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

const PLAN_CREDITS = {
    free_plan: 0,
    standard_plan: 10,
    premium_plan: 24,
}

const APPOINTMENT_CREDIT_COST = 2;

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

    console.log(`[CheckCredits] userId=${user.id}, role=${user.role}, hasBasic=${hasBasic}, hasStandard=${hasStandard}, hasPremium=${hasPremium}`);

    let currentPlan = null;
    let credits = 0;

    if (hasPremium) {
        currentPlan = "premium_plan";
        credits = PLAN_CREDITS.premium_plan;
    } else if (hasStandard) {
        currentPlan = "standard_plan";
        credits = PLAN_CREDITS.standard_plan;
    } else if (hasBasic) {
        currentPlan = "free_plan";
        credits = PLAN_CREDITS.free_plan;
    }

    console.log(`[CheckCredits] currentPlan=${currentPlan}, credits=${credits}`);

    //if user doesn't have any plan just return the user
    if (!currentPlan) {
        return user;
    }

    //check if we already allocated credits for this month
    const currentMonth = format(new Date(), "yyyy-MM");

    //Fetch latest transaction from DB for this user (safer than relying on passed `user` object)
    const latestTransaction = await db.creditTransaction.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    console.log(`[CheckCredits] latestTransaction=${latestTransaction ? JSON.stringify({ id: latestTransaction.id, type: latestTransaction.type, packageId: latestTransaction.packageId, createdAt: latestTransaction.createdAt }) : 'none'}`);

    if (latestTransaction) {
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
    console.log(`[CheckCredits] Creating transaction for user=${user.id}, amount=${credits}, packageId=${currentPlan}`);

    const updatedUser = await db.$transaction(async (tx) => {
        //create transaction record
        await tx.creditTransaction.create({
            data: {
                userId: user.id,
                amount: credits,
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
                    increment: credits,
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
        console.log(`[deductCreditsForAppointment] userId=${userId}, doctorId=${doctorId}`);

        const user = await db.user.findUnique({
            where: {id: userId },
        });

        const doctor = await db.user.findUnique({
            where: {id: doctorId},
        });

        console.log(`[deductCreditsForAppointment] userCredits=${user?.credits}, doctorExists=${!!doctor}`);

        //ensuring users have sufficient credits
        if (!user || user.credits < APPOINTMENT_CREDIT_COST) {
            throw new Error("Insufficient credits to book an appointment");
        }

        if(!doctor) {
            throw new Error("Doctor not found");
        }

        console.log(`[deductCreditsForAppointment] deducting ${APPOINTMENT_CREDIT_COST} credits`);

        //Deduct credits from patient and add to doctor
        const result = await db.$transaction(async (tx) => {
            // patient transaction (negative amount)
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: -APPOINTMENT_CREDIT_COST,
                    type: "APPOINTMENT_DEDUCTION",
                },
            });

            // create transaction record for doctor (positive amount)
            await tx.creditTransaction.create({
                data: {
                    userId: doctor.id,
                    amount: APPOINTMENT_CREDIT_COST,
                    type: "APPOINTMENT_DEDUCTION",
                },
            });

            // Update Patient's credit balance (decrement)
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    credits: {
                        decrement: APPOINTMENT_CREDIT_COST,
                    },
                },
            });

            // Update Doctor's credit balance (increment)
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

        console.log('[deductCreditsForAppointment] transaction completed');

        return {success: true, user: result };
    } catch (error) {
        console.log(error)
        return {success: false, error: error.message}
    }
}
