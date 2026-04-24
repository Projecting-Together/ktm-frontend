"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { listingFormSchema, type ListingFormData } from "@/lib/validations/listingSchema";
import { useCreateListing } from "@/lib/hooks/useListings";
import { cn } from "@/lib/utils";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Location } from "./Step2Location";
import { Step3Pricing } from "./Step3Pricing";
import { Step4Details } from "./Step4Details";
import { Step5Amenities } from "./Step5Amenities";
import { Step6Images } from "./Step6Images";
import { Step7Contact } from "./Step7Contact";
import { Step8Review } from "./Step8Review";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

const STEPS = [
  { id: 1, title: "Type", shortTitle: "Type" },
  { id: 2, title: "Location", shortTitle: "Location" },
  { id: 3, title: "Pricing", shortTitle: "Price" },
  { id: 4, title: "Details", shortTitle: "Details" },
  { id: 5, title: "Amenities", shortTitle: "Amenities" },
  { id: 6, title: "Photos", shortTitle: "Photos" },
  { id: 7, title: "Contact", shortTitle: "Contact" },
  { id: 8, title: "Review", shortTitle: "Review" },
];

// Fields validated at each step
const STEP_FIELDS: Record<number, (keyof ListingFormData)[]> = {
  1: ["listing_type", "title", "description"],
  2: ["address_line"],
  3: ["price", "price_period"],
  4: ["bedrooms", "bathrooms", "furnishing"],
  5: [],
  6: [],
  7: ["phone"],
  8: [],
};

interface ListingFormProps { listingId?: string }
export function ListingForm({ listingId }: ListingFormProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const router = useRouter();
  const { mutateAsync: createListing, isPending } = useCreateListing();

  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema) as never,
    mode: "onChange",
    defaultValues: {
      listing_type: undefined,
      price_period: "monthly",
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      pets_allowed: false,
      smoking_allowed: false,
      price_negotiable: false,
      show_phone: true,
      amenity_ids: [],
    },
  });

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = fields.length === 0 || await methods.trigger(fields);
    if (!valid) return;
    if (currentStep === 6 && images.length < 3) {
      methods.setError("root", { message: "Please upload at least 3 photos" });
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: ListingFormData) => {
    try {
      const result = await createListing({ ...data, images: images as never });
      router.push(`/manage/listings`);
    } catch (err) {
      console.error(err);
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{STEPS[currentStep - 1].title}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step indicators (desktop) */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                currentStep > step.id ? "bg-accent text-white" :
                currentStep === step.id ? "bg-accent text-white ring-4 ring-accent/20" :
                "bg-muted text-muted-foreground"
              )}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-0.5 w-8 mx-1 transition-all", currentStep > step.id ? "bg-accent" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 min-h-[400px]">
          {currentStep === 1 && <Step1BasicInfo />}
          {currentStep === 2 && <Step2Location />}
          {currentStep === 3 && <Step3Pricing />}
          {currentStep === 4 && <Step4Details />}
          {currentStep === 5 && <Step5Amenities />}
          {currentStep === 6 && <Step6Images images={images} onImagesChange={setImages} />}
          {currentStep === 7 && <Step7Contact />}
          {currentStep === 8 && <Step8Review images={images} />}

          {methods.formState.errors.root && (
            <p className="mt-4 text-sm text-destructive">{methods.formState.errors.root.message}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={goPrev} disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-1.5 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {currentStep < STEPS.length ? (
            <button type="button" onClick={goNext} className="btn-primary flex items-center gap-1.5">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={methods.handleSubmit(onSubmit)} disabled={isPending}
              className="btn-primary flex items-center gap-1.5">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <>Submit for Review <Check className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
