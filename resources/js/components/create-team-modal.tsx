import { Form } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/teams';

export default function CreateTeamModal({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
                <Form
                    key={String(open)}
                    {...store.form()}
                    encType="multipart/form-data"
                    className="space-y-4"
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create a new team</DialogTitle>
                                <DialogDescription>
                                    Create a new team to collaborate with
                                    others.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create-team-name">
                                        Team name
                                    </Label>
                                    <Input
                                        id="create-team-name"
                                        name="name"
                                        data-test="create-team-name"
                                        placeholder="My team"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create-team-phone">
                                        Phone
                                    </Label>
                                    <Input
                                        id="create-team-phone"
                                        name="phone"
                                        placeholder="+1..."
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create-team-mobile">
                                        Mobile
                                    </Label>
                                    <Input
                                        id="create-team-mobile"
                                        name="mobile"
                                        placeholder="+1..."
                                    />
                                    <InputError message={errors.mobile} />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create-team-email">
                                        Email address
                                    </Label>
                                    <Input
                                        id="create-team-email"
                                        name="email"
                                        type="email"
                                        placeholder="team@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create-team-logo">
                                        Logo (JPEG, PNG, or WebP; max 2 MB)
                                    </Label>
                                    <Input
                                        id="create-team-logo"
                                        name="logo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                    />
                                    <InputError message={errors.logo} />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create-team-address">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="create-team-address"
                                        name="address"
                                        rows={2}
                                        placeholder="Team location / facility address"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="create-team-submit"
                                    disabled={processing}
                                >
                                    Create team
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
