import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grip, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { SelectSkill } from '@/types/skills';

type Props = {
    skill: SelectSkill;
    deletingId: number | null;
    isPending: boolean;
    onDelete: (skill: SelectSkill) => void;
    onEdit: (skill: SelectSkill) => void;
};

export default function SortableSkillCard({
    skill,
    deletingId,
    isPending,
    onDelete,
    onEdit,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: skill.id,
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            className={cn('relative', isDragging && 'z-50 shadow-xl ring-2 ring-primary/30')}
            ref={setNodeRef}
            style={style}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <button
                            aria-label="Drag to reorder"
                            className="cursor-grab p-2 touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
                            suppressHydrationWarning
                            type="button"
                            {...attributes}
                            {...listeners}
                        >
                            <Grip className="size-6" />
                        </button>
                        <Image
                            alt={skill.title}
                            className="rounded object-contain"
                            height={40}
                            src={buildCloudinaryUrl(skill.icon)}
                            width={40}
                        />
                        <CardTitle className="text-base">{skill.title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex gap-2">
                    <Button
                        className="flex-1"
                        onClick={() => onEdit(skill)}
                        size="sm"
                        variant="outline"
                    >
                        <Pencil className="mr-2 h-3 w-3" />
                        Edit
                    </Button>
                    <Button
                        disabled={deletingId === skill.id && isPending}
                        loading={deletingId === skill.id && isPending}
                        onClick={() => onDelete(skill)}
                        size="sm"
                        variant="outline"
                    >
                        {(deletingId === skill.id && isPending) || (
                            <Trash2 className="h-3 w-3 text-destructive" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
