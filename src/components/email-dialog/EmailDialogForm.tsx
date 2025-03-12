
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RadiusSelect } from "../RadiusSelect"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  radius: z.string(),
})

type FormValues = z.infer<typeof formSchema>

interface EmailDialogFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const EmailDialogForm = ({ 
  onSubmit, 
  isSubmitting 
}: EmailDialogFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      radius: "5" // Changed to match fixed 5km radius
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="radius"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadiusSelect 
                  radius={parseInt(field.value, 10)}
                  onChange={(value) => field.onChange(value.toString())}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting up..." : "Add to watchlist"}
        </Button>
      </form>
    </Form>
  );
};
