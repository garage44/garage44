import {Signal, batch, computed, signal} from '@preact/signals'

export interface ValidationRule<T = unknown> {
    message: string
    test: (value: T) => boolean
}

// The ModelRef should handle Signal<T> only now
export type ModelRef<T = unknown> = Signal<T>

// Simplified: just modelRef and rules, no nested array
export type ValidationEntry = [ModelRef, ...ValidationRule[]]

// Store touched state globally
const touchedModelRefs = new Map<ModelRef, Signal<boolean>>()

// Global function to mark a model as touched
export function setTouched(modelRef: ModelRef, touched = true) {
    let touchedSignal = touchedModelRefs.get(modelRef)
    if (!touchedSignal) {
        // Create a new signal if one doesn't exist
        touchedSignal = signal(false)
        touchedModelRefs.set(modelRef, touchedSignal)
    }
    touchedSignal.value = touched
}

// Combine multiple validation rules into one
export const and = (...rules: ValidationRule[]): ValidationRule => ({
    // Use first failing message, or empty string if all pass
    message: rules.find(r => !r.test)?.message || '',
    // All rules must pass
    test: (value) => rules.every(rule => rule.test(value)),
})

// Add a new interface for validation result
export interface ValidationResult {
    isValid: boolean
    errors: string[]
    isDirty: boolean
    isTouched: boolean
}

// Add this helper function to aggregate validation errors
export function getValidationErrors(validation: Record<string, ValidationResult>) {
    const errors: string[] = []
    for (const field in validation) {
        const fieldErrors = validation[field].errors
        if (fieldErrors.length > 0) {
            errors.push(...fieldErrors)
        }
    }

    return errors.join('<br/>')
}

export function createValidator<T extends Record<string, ValidationEntry>>(validations: T) {
    // Track initial values to determine if fields are dirty
    const initialValues = new Map<ModelRef, unknown>()

    // Initialize the initialValues map and touched state
    for (const [, [modelRef]] of Object.entries(validations)) {
        initialValues.set(modelRef, modelRef.value)

        // Ensure each model has a touchedSignal
        if (!touchedModelRefs.has(modelRef)) {
            touchedModelRefs.set(modelRef, signal(false))
        }
    }

    const validationState = computed(() => {
        const result: Record<string, ValidationResult> = {}

        for (const [field, [modelRef, ...rules]] of Object.entries(validations)) {
            const fieldErrors: string[] = []
            const value = modelRef.value

            // Check if the field is dirty by comparing with initial value
            const isDirty = value !== initialValues.get(modelRef)

            // Get the touched state from global map
            const isTouched = touchedModelRefs.get(modelRef)?.value || false

            for (const rule of rules) {
                if (!rule.test(value)) {
                    fieldErrors.push(rule.message)
                }
            }

            result[field] = {
                errors: fieldErrors,
                isDirty,
                isTouched,
                isValid: fieldErrors.length === 0,
            }
        }

        return result
    })

    const isValid = computed(() => Object.values(validationState.value).every(v => v.isValid))
    const errors = computed(() => {
        // Only compute errors when form is invalid
        if (isValid.value) return 'Form is valid...'
        return getValidationErrors(validationState.value)
    })

    // Check if any field is marked as dirty
    const isDirty = computed(() =>
        Object.values(validationState.value).some(v => v.isDirty),
    )

    // Check if any field has been touched
    const isTouched = computed(() =>
        Object.values(validationState.value).some(v => v.isTouched),
    )

    // Function to reset the initial values and mark form as clean
    const resetDirty = () => {
        for (const [, [modelRef]] of Object.entries(validations)) {
            initialValues.set(modelRef, modelRef.value)
        }
    }

    // Function to mark all fields as touched
    const markAllTouched = () => {
        batch(() => {
            for (const [, [modelRef]] of Object.entries(validations)) {
                setTouched(modelRef, true)
            }
        })
    }

    // Function to reset touched state for all fields
    const resetTouched = () => {
        batch(() => {
            for (const [, [modelRef]] of Object.entries(validations)) {
                setTouched(modelRef, false)
            }
        })
    }

    // Function to mark all fields as dirty
    const markAllDirty = () => {
        for (const [, [modelRef]] of Object.entries(validations)) {
            // Set initial values to something different to force dirty state
            initialValues.set(modelRef, Symbol('dirty'))
        }
    }

    return {
        errors,
        isDirty,
        isTouched,
        isValid,
        markAllDirty,
        markAllTouched,
        resetDirty,
        resetTouched,
        validation: validationState,
    }
}

// Validation rule helpers
export const required = (message: string): ValidationRule => ({
    message,
    test: (v: unknown) => v != null && v !== '',
})

export const minLength = (length: number, message: string): ValidationRule => ({
    message,
    test: (v: string) => typeof v === 'string' && v.length >= length,
})

export const email = (message: string): ValidationRule => ({
    message,
    test: (v: string) => typeof v === 'string' && /^[^@]+@[^@]+\.[^@]+$/.test(v),
})
