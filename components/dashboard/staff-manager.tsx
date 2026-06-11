"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, MailPlus, Trash2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type StaffRow = {
    id: string;
    name: string;
    email: string | null;
    imageUrl: string | null;
    role: "OWNER" | "ADMIN" | "STAFF";
    isSelf: boolean;
};

export type InviteRow = {
    id: string;
    email: string;
    expiresAt: string;
};

const ROLE_LABELS: Record<StaffRow["role"], string> = {
    OWNER: "Eigenaar",
    ADMIN: "Beheerder",
    STAFF: "Teamlid",
};

const inviteSchema = z.object({
    email: z.email("Vul een geldig e-mailadres in"),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function StaffManager({
    staff,
    invites,
    isOwner,
}: {
    staff: StaffRow[];
    invites: InviteRow[];
    isOwner: boolean;
}) {
    const router = useRouter();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError: setFormError,
        formState: { errors, isSubmitting },
    } = useForm<InviteValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: "" },
    });

    async function sendInvite(values: InviteValues) {
        const res = await fetch("/api/staff/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email.toLowerCase() }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setFormError("root", {
                message:
                    typeof data?.error === "string"
                        ? data.error
                        : "De uitnodiging kon niet worden verstuurd",
            });
            return;
        }
        reset();
        setInviteOpen(false);
        router.refresh();
    }

    async function removeStaff(id: string) {
        setDeletingId(id);
        setError(null);
        const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(
                typeof data?.error === "string"
                    ? data.error
                    : "Het teamlid kon niet worden verwijderd"
            );
        }
        setDeletingId(null);
        router.refresh();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {staff.length} {staff.length === 1 ? "teamlid" : "teamleden"}
                </p>
                {isOwner && (
                    <Button onClick={() => setInviteOpen(true)} className="cursor-pointer">
                        <UserPlus className="mr-2 size-4" />
                        Teamlid uitnodigen
                    </Button>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="divide-y overflow-hidden rounded-2xl border bg-card">
                {staff.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 px-4 py-3.5">
                        <Avatar className="size-9">
                            <AvatarImage src={member.imageUrl ?? undefined} alt={member.name} />
                            <AvatarFallback>
                                {member.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">
                                {member.name}
                                {member.isSelf ? (
                                    <span className="text-muted-foreground"> (jij)</span>
                                ) : null}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {member.email ?? "—"}
                            </span>
                        </div>
                        <Badge variant={member.role === "OWNER" ? "default" : "outline"}>
                            {ROLE_LABELS[member.role]}
                        </Badge>
                        {isOwner && !member.isSelf && member.role !== "OWNER" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingId === member.id}
                                onClick={() => removeStaff(member.id)}
                                aria-label={`${member.name} verwijderen`}
                                className="cursor-pointer text-muted-foreground hover:text-destructive"
                            >
                                {deletingId === member.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Trash2 className="size-4" />
                                )}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {invites.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Openstaande uitnodigingen
                    </p>
                    <div className="divide-y overflow-hidden rounded-2xl border bg-muted/40">
                        {invites.map((invite) => (
                            <div key={invite.id} className="flex items-center gap-3 px-4 py-3">
                                <MailPlus className="size-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 truncate text-sm">{invite.email}</span>
                                <span className="text-xs text-muted-foreground">
                                    verloopt{" "}
                                    {new Intl.DateTimeFormat("nl-NL", {
                                        day: "numeric",
                                        month: "short",
                                    }).format(new Date(invite.expiresAt))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Teamlid uitnodigen</DialogTitle>
                        <DialogDescription>
                            We sturen een e-mail met een beveiligde aanmeldlink. Daarmee
                            maakt je teamlid een account aan dat direct aan jouw salon
                            gekoppeld is.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(sendInvite)} className="flex flex-col gap-4">
                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="invite-email">E-mailadres</FieldLabel>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="collega@salon.nl"
                                aria-invalid={!!errors.email}
                                {...register("email")}
                            />
                            <FieldError errors={[errors.email]} />
                        </Field>
                        {errors.root && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.root.message}
                            </p>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <MailPlus className="mr-2 size-4" />
                            )}
                            Uitnodiging versturen
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
