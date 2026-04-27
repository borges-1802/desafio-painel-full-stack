'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
    onReview: () => void
    isLoading?: boolean
}

export function ReviewActionCard({ onReview, isLoading }: Props) {
    const [open, setOpen] = useState(false)

    function handleConfirm() {
        onReview()
        setOpen(false)
    }

    return (
        <div className="rounded-xl border p-5 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <p className="text-sm font-semibold">Confirmar revisão do caso</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ao confirmar, este caso será marcado como revisado no sistema</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isLoading} className="bg-rio-blue hover:bg-rio-blue-mid w-full text-white sm:w-auto">
                        {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2 text-foreground" />
                            Salvando...
                        </>
                        ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-white" />
                            Confirmar revisão
                        </>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar revisão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja marcar este caso como revisado? Essa ação será registrada no sistema.</DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirm} disabled={isLoading} className="bg-rio-blue hover:bg-rio-blue-mid text-white">
                            {isLoading ? (
                                <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" />
                                Salvando...
                                </>
                            ) : (
                                'Confirmar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}