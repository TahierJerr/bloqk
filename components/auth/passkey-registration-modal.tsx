"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

export function PasskeyRegistrationModal() {
    // Modal & Form State
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Visibility State
    const [hasPasskey, setHasPasskey] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // 1. Check for existing passkeys on mount
    useEffect(() => {
        async function checkPasskeys() {
            try {
                const { data } = await authClient.passkey.listUserPasskeys();
                
                if (data && data.length > 0) {
                    setHasPasskey(true);
                }
            } catch (err) {
                console.error("Failed to fetch passkeys:", err);
            } finally {
                setIsChecking(false);
            }
        }
        
        checkPasskeys();
    }, []);

    // 2. Hide the component entirely if they have a passkey (or while checking)
    if (isChecking || hasPasskey) {
        return null;
    }

    // 3. Handle Registration
    async function handleAddPasskey() {
        setLoading(true);
        setErrorMsg("");

        const { error } = await authClient.passkey.addPasskey({
            name: deviceName || "My Device",
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message ?? "An unknown error occurred");
        } else {
            setIsOpen(false);
            setDeviceName("");
            setHasPasskey(true); // This will immediately unmount the component
            toast.success("Passkey registered successfully! You can now use it to sign in.");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Fingerprint className="h-4 w-4" />
                    Set up Passkey
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Enable Passkey Login</DialogTitle>
                    <DialogDescription>
                        Skip the password next time. Register your device&apos;s fingerprint, face scan, or screen lock to sign in instantly.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="deviceName">Device Name (Optional)</Label>
                        <Input
                            id="deviceName"
                            placeholder="e.g. My Personal iPhone"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {errorMsg && (
                        <p className="text-sm text-destructive">{errorMsg}</p>
                    )}
                </div>
                
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddPasskey} disabled={loading}>
                        {loading ? "Waiting for device..." : "Create Passkey"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}