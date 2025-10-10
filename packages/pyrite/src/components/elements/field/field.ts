export default {
    computed: {
        invalidFieldValue: function() {
            if (!this.validation) return null
            if (!this.validation.$dirty) return null
            // Validation for `requiredIf` depends on the state of other
            // fields. Therefor don't use the $dirty check on this field,
            // but go straight for the $invalid state.
            if ('requiredIf' in this.validation) {
                return this.validation.$invalid
            }

            // Invalid has 3 states: true, false and null (not changed/dirty).
            return this.validation.$error
        },
    },
    methods: {
        classes: function() {
            const classes = {}

            if (this.validation) {
                if (this.validation.required === false || this.validation.required === true) {
                    classes.required = true
                }
            }
            return classes
        },
        updateModel: function(e) {
            this.$emit('update:modelValue', `${this.modelValue}${e.target.value}`)
        },
    },
    props: {
        autocomplete: String,
        autofocus: {
            default: () => false,
            type: [Boolean, String],
        },
        disabled: Boolean,
        elementclass: String,
        help: String,
        label: String,
        modelValue: String,
        name: String,
        placeholder: String,
        readonly: Boolean,
        validation: Object,
    },
}
