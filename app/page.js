import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowBigDown, ArrowRight, Check, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { creditBenefits, features, testimonials } from "@/lib/data";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden py-32">
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variants="outline" className="bg-blue-600 border-blue-800 text-white text-md font-medium px-4 py-1">HealthCare made Simple </Badge>            
              <h1 className="text-4xl lg:text-6xl md:text-5xl font-bold text-white leading-tight ">
                Connect with Doctors<br />
                <span className="gradient-title">Anytime and Anywhere</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-md">Book Appointments, Check Blood Availability, consult with doctors virtually through video calling and other sms services with professionals to ease your healthcare journey with ease.</p>
              <div className="flex flex-col sm:flex-row gap-4 my-4">
                <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-white hover:text-black">
                  <Link href={"/onboarding"}>Book Appointment <ArrowRight/> </Link>
                </Button>

                <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-white hover:text-black">
                  <Link href={"/doctors"}>Find Doctors <ArrowRight/> </Link>
                </Button>
              </div>
            </div>

            <div className="relative w-full h-110 md:h-120 overflow-hidden rounded-xl">
              <Image src="/banner.jpg" alt="HomePage-image" fill priority className="object-cover w-full h-full"/>
            </div>

           
          </div>
        </div>
      </section>


      <section className="py-20 bg-muted/40"> 
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              How it Works
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our Platform makes healthcare accessible with just a few clicks
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              return (
                <Card key={index} className="border hover:border-blue-600 transition-all duration-400 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="p-3 rounded-lg w-fit mb-2">{feature.icon}</div>
                    <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className=" px-4 py-2">
          <div className="text-center mb-16">
            <Badge className="text-sm font-semibold mb-4 px-4 py-1 bg-blue-600 text-white border-blue-800">Affordable Healthcare Services</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Service Subscription Packages
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose the perfect consultation package that fits your healthcare needs              </p>
            </div>
              {/* Pricing Table */}
              
            <div>
              <Pricing />
                <Card className="mt-12 bg-muted/30 border-blue-600/30">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white flex items-center"><Stethoscope className="mr-2 text-blue-600" />How Our Credit Works <ArrowBigDown className="ml-2 text-blue-600"/></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                        {creditBenefits.map((benefit, index) => {
                          return (
                            <li key={index} className="flex items-start">
                              <div className="mr-3 mt-1 rounded-full flex">
                                <Check className="text-blue-600"/>
                              </div> 
                              <p className="text-muted-foreground" dangerouslySetInnerHTML={{__html: benefit }} />
                            </li>
                          )
                        })}
                    </ul>
                  </CardContent>
                 
                </Card>
            </div>
        </div>
     </section>

      {/* Testimonials */}
     <section className="py-20">
      <div className="container mx-auto text-center">
        <Badge className="bg-blue-600 font-bold text-sm text-white mb-4 px-4 py-1">Success Stories</Badge>
        <h1 className="mb-4 text-2xl font-serif ">What Our Users Say</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border hover:border-blue-800 transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mr-4">
                      <span className="text-blue-500 font-bold">
                        {testimonial.initials}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-medium text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
            
          </div>
        </div>
     </section>

      <section className="py-20">
        <div className="mx-auto px-4">
          <Card className="border">
            <CardContent className="p-8 md:p-12 lg:p-16 relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to take control of your healthcare?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of users who have simplified their healthcare
                  journey with our platform. Get started today and experience
                  healthcare the way it should be.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-white hover:text-black"
                  >
                    <Link href="/sign-up">Sign Up Now</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-white hover:bg-blue-600"
                  >
                    <Link href="#pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
