import { Head, router } from '@inertiajs/react';
import { Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { index, store } from '@/routes/teams/users';
import type { RoleOption, Team, TeamMember, TeamPermissions } from '@/types';

type SpatieRole = {
    id: number;
    name: string;
};

type Props = {
    team: Team;
    members: TeamMember[];
    availableTeamRoles: RoleOption[];
    spatieRoles: SpatieRole[];
    permissions: TeamPermissions;
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    team_role: string;
    spatie_roles: number[];
};

const blankForm: UserForm = {
    name: '',
    email: '',
    password: '',
    team_role: 'member',
    spatie_roles: [],
};

export default function TeamUsersIndex({
    team,
    members,
    availableTeamRoles,
    spatieRoles,
    permissions,
}: Props) {
    const getInitials = useInitials();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState<UserForm>(blankForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const pageTitle = useMemo(
        () => `Users — ${team.name}`,
        [team.name],
    );

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            store({ team: team.slug }),
            {
                name: form.name,
                email: form.email,
                password: form.password,
                team_role: form.team_role,
                spatie_roles: form.spatie_roles,
            },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setForm(blankForm);
                    setDialogOpen(false);
                    setErrors({});
                    setProcessing(false);
                },
            },
        );
    };

    const handleSpatieRoleToggle = (roleId: number) => {
        setForm((prev) => ({
            ...prev,
            spatie_roles: prev.spatie_roles.includes(roleId)
                ? prev.spatie_roles.filter((id) => id !== roleId)
                : [...prev.spatie_roles, roleId],
        }));
    };

    return (
        <>
            <Head title={pageTitle} />

            <div className="flex w-full flex-col space-y-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Team Users"
                            description={`Manage users belonging to ${team.name}`}
                        />

                        {permissions.canAddMember && (
                            <Button
                                onClick={() => setDialogOpen(true)}
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add user
                            </Button>
                        )}
                    </div>

                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Team role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No users found in this team.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        {member.avatar ? (
                                                            <AvatarImage
                                                                src={member.avatar}
                                                                alt={member.name}
                                                            />
                                                        ) : null}
                                                        <AvatarFallback>
                                                            {getInitials(member.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {member.role_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {member.spatieRoles && member.spatieRoles.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.spatieRoles.map((role) => (
                                                            <Badge
                                                                key={role}
                                                                variant="outline"
                                                            >
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.created_at
                                                    ? new Date(member.created_at).toLocaleDateString()
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add user to team</DialogTitle>
                        <DialogDescription>
                            Create a new user account and add them to {team.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Minimum 8 characters"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="team_role">Team role</Label>
                            <Select
                                value={form.team_role}
                                onValueChange={(value) =>
                                    setForm({ ...form, team_role: value })
                                }
                            >
                                <SelectTrigger id="team_role">
                                    <SelectValue placeholder="Select a team role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeamRoles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.team_role} />
                        </div>

                        {spatieRoles.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <div className="flex flex-wrap gap-2">
                                    {spatieRoles.map((role) => {
                                        const isSelected =
                                            form.spatie_roles.includes(role.id);
                                        return (
                                            <Button
                                                key={role.id}
                                                type="button"
                                                variant={isSelected ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() =>
                                                    handleSpatieRoleToggle(
                                                        role.id,
                                                    )
                                                }
                                            >
                                                {role.name}
                                                {isSelected && (
                                                    <X className="ml-1 h-3 w-3" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.spatie_roles} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDialogOpen(false);
                                    setErrors({});
                                    setForm(blankForm);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create user'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

