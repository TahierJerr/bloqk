import { Logo } from "@/components/logo";
import { OrderForm } from "@/components/order-form/order-form";

export default function Page() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-8 sm:gap-8 sm:py-16">
            <OrderForm />
        </main>
    );
}