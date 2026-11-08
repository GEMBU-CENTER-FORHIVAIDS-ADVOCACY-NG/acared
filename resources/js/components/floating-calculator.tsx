import { Calculator, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface FloatingCalculatorProps {
    /** When provided, controls the open state from the parent. */
    isOpen?: boolean;
    /** Callback when the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Whether to show the floating toggle button. Default true. */
    showToggle?: boolean;
    /** When true, render as a centered modal overlay instead of a fixed panel. */
    modal?: boolean;
}

export default function FloatingCalculator({
    isOpen: controlledIsOpen,
    onOpenChange,
    showToggle = true,
    modal = false,
}: FloatingCalculatorProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalOpen;
    const ref = useRef<HTMLDivElement>(null);

    const setIsOpen = (open: boolean) => {
        if (isControlled) {
            onOpenChange?.(open);
        } else {
            setInternalOpen(open);
        }
    };
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const handleNumber = (num: string) => {
        if (waitingForOperand) {
            setDisplay(num);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const calculate = (a: number, b: number, op: string): number => {
        switch (op) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '×':
                return a * b;
            case '÷':
                return b !== 0 ? a / b : 0;
            default:
                return b;
        }
    };

    const handleOperation = (nextOp: string) => {
        const currentValue = parseFloat(display);

        if (previousValue !== null && operation && !waitingForOperand) {
            const result = calculate(parseFloat(previousValue), currentValue, operation);
            const resultStr = parseFloat(result.toFixed(10)).toString();
            setDisplay(resultStr);
            setPreviousValue(resultStr);
        } else {
            setPreviousValue(currentValue.toString());
        }

        setOperation(nextOp);
        setWaitingForOperand(true);
    };

    const handleEquals = () => {
        if (previousValue === null || operation === null) return;

        const currentValue = parseFloat(display);
        const result = calculate(parseFloat(previousValue), currentValue, operation);
        const resultStr = parseFloat(result.toFixed(10)).toString();

        setDisplay(resultStr);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const handlePercent = () => {
        const currentValue = parseFloat(display);
        setDisplay((currentValue / 100).toString());
    };

    const handleToggleSign = () => {
        const currentValue = parseFloat(display);
        setDisplay((currentValue * -1).toString());
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;

            // Numbers
            if (/^[0-9]$/.test(key)) {
                e.preventDefault();
                handleNumber(key);
                return;
            }

            // Decimal
            if (key === '.' || key === ',') {
                e.preventDefault();
                handleDecimal();
                return;
            }

            // Operations
            if (key === '+') {
                e.preventDefault();
                handleOperation('+');
                return;
            }
            if (key === '-') {
                e.preventDefault();
                handleOperation('-');
                return;
            }
            if (key === '*') {
                e.preventDefault();
                handleOperation('×');
                return;
            }
            if (key === '/') {
                e.preventDefault();
                handleOperation('÷');
                return;
            }

            // Equals
            if (key === 'Enter' || key === '=') {
                e.preventDefault();
                handleEquals();
                return;
            }

            // Clear
            if (key === 'Escape' || key === 'c' || key === 'C') {
                e.preventDefault();
                handleClear();
                return;
            }

            // Percent
            if (key === '%') {
                e.preventDefault();
                handlePercent();
                return;
            }

            // Backspace - remove last digit
            if (key === 'Backspace') {
                e.preventDefault();
                if (waitingForOperand) return;
                if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
                    setDisplay('0');
                } else {
                    setDisplay(display.slice(0, -1));
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, display, previousValue, operation, waitingForOperand]);

    const buttons = [
        { label: 'C', action: handleClear, className: 'text-destructive font-semibold' },
        { label: '±', action: handleToggleSign, className: 'text-muted-foreground' },
        { label: '%', action: handlePercent, className: 'text-muted-foreground' },
        { label: '÷', action: () => handleOperation('÷'), className: 'bg-primary/10 text-primary hover:bg-primary/20' },
        { label: '7', action: () => handleNumber('7') },
        { label: '8', action: () => handleNumber('8') },
        { label: '9', action: () => handleNumber('9') },
        { label: '×', action: () => handleOperation('×'), className: 'bg-primary/10 text-primary hover:bg-primary/20' },
        { label: '4', action: () => handleNumber('4') },
        { label: '5', action: () => handleNumber('5') },
        { label: '6', action: () => handleNumber('6') },
        { label: '-', action: () => handleOperation('-'), className: 'bg-primary/10 text-primary hover:bg-primary/20' },
        { label: '1', action: () => handleNumber('1') },
        { label: '2', action: () => handleNumber('2') },
        { label: '3', action: () => handleNumber('3') },
        { label: '+', action: () => handleOperation('+'), className: 'bg-primary/10 text-primary hover:bg-primary/20' },
        { label: '0', action: () => handleNumber('0'), className: 'col-span-2' },
        { label: '.', action: handleDecimal },
        { label: '=', action: handleEquals, className: 'bg-primary text-primary-foreground hover:bg-primary/90' },
    ];

    const calculatorBody = (
        <>
            {/* Display */}
            <div className="mb-2 rounded-md bg-muted p-2 text-right">
                <div className="min-h-[1.25rem] text-[10px] text-muted-foreground">
                    {previousValue !== null && operation
                        ? `${previousValue} ${operation}`
                        : ''}
                </div>
                <div className="truncate text-lg font-semibold tabular-nums">
                    {display}
                </div>
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-4 gap-1.5">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        type="button"
                        onClick={btn.action}
                        className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${btn.className ?? ''}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <>
            {/* Toggle Button */}
            {showToggle && (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Toggle calculator"
                >
                    {isOpen ? <X className="size-6" /> : <Calculator className="size-6" />}
                </button>
            )}

            {/* Modal Mode */}
            {modal && isOpen && (
                <div
                    ref={ref}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in-0"
                    onClick={() => setIsOpen(false)}
                >
                    <Card
                        className="w-60 animate-in zoom-in-95 fade-in-0 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardContent className="p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-xs font-semibold">Calculator</h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-5 w-5 p-0"
                                    aria-label="Close calculator"
                                >
                                    <X className="size-3" />
                                </Button>
                            </div>
                            {calculatorBody}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Fixed Panel Mode */}
            {!modal && isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-72 animate-in slide-in-from-bottom-4 fade-in-0">
                    <Card className="shadow-xl">
                        <CardContent className="p-4">
                            {calculatorBody}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
