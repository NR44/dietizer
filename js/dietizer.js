new Vue({
    el: '#dietizer-app',
    data: {
        adjustedBWRatio: 0,
        gender: null,
        onVent: null,
        hasTrauma: null,
        hasBurns: null,
        age: '',
        height: '',
        weight: '',
        temperature: '',
        ventRate: '',
        formula: '',
        kcalFormula: '',
        fluidsFormula: '',
        proteinFormula: '',
        bmiStatus: '',
        minFluids: 0
    },
    computed: {
        bmiColor: function () {
            switch (true) {
                case this.bmiStatus === "Underweight":
                    return "table-warning";
                case this.bmiStatus === "Healthy Weight":
                    return "table-success";
                case this.bmiStatus === "Overweight":
                    return "table-warning";
                case this.bmiStatus === "Obese":
                    return "table-danger";
            }
        },
        adjustedBW: function () {
            this.adjustedBWRatio = (parseFloat(this.weight, 10) / parseFloat(this.idealBW, 10) * 100).toFixed(0);
            return ((this.weight - parseFloat(this.idealBW, 10)) * .25 + parseFloat(this.idealBW, 10)).toFixed(1);
        },
        idealBW: function () {
            let heightIncm = this.height / 2.54;
            let ibw = 0;
            if (this.height === '') return 0;
            else {
                switch (true) {
                    case heightIncm >= 60 && this.gender === "Female":
                        ibw = (100 + 5 * (heightIncm - 60)) / 2.2;
                        break;
                    case heightIncm < 60 && this.gender === "Female":
                        ibw = (100 - 5 * (60 - heightIncm)) / 2.2;
                        break;
                    case heightIncm >= 60 && this.gender === "Male":
                        ibw = (106 + 6 * (heightIncm - 60)) / 2.2;
                        break;
                    case heightIncm < 60 && this.gender === "Male":
                        ibw = (106 - 6 * (60 - heightIncm)) / 2.2;
                        break;
                    default:
                        ibw = 0;
                        break;
                }
            }
            return ibw.toFixed(1);
        },
        calPerK: function () {
            let upper, lower = 0;
            if (this.weight === '') return 0;
            else {
                switch (true) {
                    case this.bmi < 30:
                        lower = 25 * this.weight;
                        upper = 30 * this.weight;
                        this.kcalFormula = "25-30 kcal/kg Actual Weight (BMI < 30)";
                        break;
                    case this.bmi >= 30 && this.bmi <= 50:
                        lower = 11 * this.weight;
                        upper = 14 * this.weight
                        this.kcalFormula = "11-14 kcal/kg Actual Weight (BMI 30-50)";
                        break;
                    case this.bmi > 50:
                        lower = 22 * this.idealBW;
                        upper = 25 * this.idealBW;
                        this.kcalFormula = "22-25 kcal/kg IBW (BMI > 50)";
                        break;
                    default:
                        break;
                }
                this.minFluids = Math.ceil(lower);
                return `${Math.ceil(lower)} - ${Math.ceil(upper, 10)}`;
            }
        },
        canDoMiffinSJ: function () {
            return this.weight !== '' && this.height !== '' && this.age !== '';
        },
        canDoModPennState: function () {
            return this.canDoMiffinSJ && this.ventRate !== '' && this.temperature !== '';
        },
        canDoPennState: function () {
            return this.canDoMiffinSJ && this.ventRate !== '' && this.temperature !== '';
        },
        canDoIretonJones92: function () {
            return this.age !== '' && this.weight !== '' && this.gender !== '' && this.hasBurns !== '';
        },
        bmi: function () {
            if (this.weight === '' || this.height === '') {
                return 0;
            } else {
                const w = parseInt(this.weight, 10);
                const h = parseInt(this.height, 10);
                const bmi = (w / Math.pow(h / 100, 2));
                if (bmi < 18.5) this.bmiStatus = 'Underweight';
                if (bmi >= 18.5 && bmi <= 24.9) this.bmiStatus = 'Healthy Weight';
                if (bmi >= 25 && bmi < 30) this.bmiStatus = 'Overweight';
                if (bmi >= 30) this.bmiStatus = 'Obese';
                return bmi.toFixed(1);
            }
        },
        miffinSJ: function () {
            if (this.canDoMiffinSJ) {
                const w = parseFloat(this.weight, 10);
                const h = parseFloat(this.height, 10);
                const a = parseInt(this.age, 10);
                if (this.gender === "Male") {
                    return Math.ceil(10 * w + 6.25 * h - 5 * a + 5);
                } else {
                    return Math.ceil(10 * w + 6.25 * h - 5 * a - 161);
                }
            } else return "can't do it!"
        },
        pennState: function () {
            if (this.canDoPennState) {
                const v = parseFloat(this.ventRate, 10);
                const t = parseFloat(this.temperature, 10);
                return Math.ceil(this.miffinSJ * .96 + v * 31 + t * 167 - 6212);
            } else return "can't do it!"
        },
        modPennState: function () {
            if (this.canDoModPennState) {
                const v = parseFloat(this.ventRate, 10);
                const t = parseFloat(this.temperature, 10);
                return Math.ceil(this.miffinSJ * .71 + v * 64 + t * 85 - 3085);
            } else return "can't do it!"
        },
        iertonJones92: function () {
            if (this.canDoIretonJones92) {
                const a = parseInt(this.age, 10);
                const w = parseFloat(this.weight, 10);
                const g = this.gender === "Male" ? 281 : 0;
                const t = this.hasTrauma === "Yes" ? 292 : 0;
                const b = this.hasBurns === "Yes" ? 851 : 0;
                return Math.ceil(1925 - 10 * a + 5 * w + g + t + b);
            }

        },
        protein: function () {
            if (this.weight === '') {
                return 0;
            } else {
                w = parseFloat(this.weight, 10).toFixed(1);
                if (this.bmi < 30) {
                    this.proteinFormula = "1.2-2 g/kg Actual Weight (BMI < 30)";
                    return `${Math.ceil(1.2 * w)}-${Math.ceil(2 * w)} `;
                } else if (this.bmi >= 30 && this.bmi <= 39.9) {
                    this.proteinFormula = "at least 2 g/kg IBW (BMI 30-39.9)";
                    return `At least: ${Math.ceil(2 * this.idealBW)} `;
                } else {
                    this.proteinFormula = "up to 2.5 g/kg IBW (BMI >= 40)";
                    return `${Math.floor(2.5 * this.idealBW)} `;
                }
            }
        },
        fluids: function () {
            let fluids = 0;
            const w = this.weight;
            if (parseFloat(this.bmi, 10) < 30) {
                switch (true) {
                    case w >= 1 && w <= 10:
                        fluids = 100 * w;
                        this.fluidsFormula = "100mL/kg";
                        break;
                    case w > 10 && w <= 20:
                        fluids = (1000 + 50 * w) / 10;
                        this.fluidsFormula = "1000mL + 50mL/kg over 10kg";
                        break;
                    case w > 20 && this.age < 50:
                        fluids = 1500 + 20 * (w - 20);
                        this.fluidsFormula = "1500mL + 20mL/kg over 20kg";
                        break;
                    case w > 20 && this.age >= 50:
                        fluids = 1500 + 15 * (w - 20);
                        this.fluidsFormula = "1500mL + 15mL/kg over 20kg";
                        break;
                    default:
                        fluids;
                        break;
                }
            } else {
                const aw = (this.weight - parseFloat(this.idealBW, 10)) * .25 + parseFloat(this.idealBW, 10);
                switch (true) {
                    case this.age > 75:
                        fluids = 25 * aw;
                        this.fluidsFormula = "Age > 75 yrs: 25 mL/kg * Adjusted Weight"
                        break;
                    case this.age >= 56 && this.age <= 75:
                        fluids = 30 * aw;
                        this.fluidsFormula = "Age 56-74 yrs: 30 mL/kg Adjusted Weight"
                        break;
                    case this.age >= 18 && this.age <= 55:
                        fluids = 35 * aw;
                        this.fluidsFormula = "Age 18-55 yrs: 35 mL/kg * Adjusted Weight"
                        break;
                    default:
                        fluids;
                        break;
                }
            }
            return Math.ceil(fluids);
        },
        chooseFormula: function () {
            if (this.weight === '') {
                return 0;
            } else {
                if (this.onVent === "No") {
                    this.formula = 'Miffin-St Jeor';
                    return this.miffinSJ;
                }
                if (this.onVent === "Yes" && this.hasTrauma === "Yes" && this.hasBurns === "Yes") {
                    this.formula = 'Ireton Jones 1992';
                    return this.iertonJones92;
                }
                if (this.onVent === "Yes" && this.hasTrauma === "Yes" && this.hasBurns === "No") {
                    this.formula = 'Penn State Equation (2003)';
                    return this.pennState;
                }
                if (this.onVent === "Yes" && this.hasTrauma === "No" && this.bmi > 30 && this.age > 60) {
                    this.formula = 'Modified Penn State Equation (2010)'
                    return this.modPennState
                }
                if (this.onVent === "Yes" && this.hasTrauma === "No" && this.bmi < 30 || (this.bmi > 30 && this.age <= 60)) {
                    this.formula = 'Penn State Equation (2003)';
                    return this.pennState;
                }
            }
        },
    },
    methods: {
        clearAll: function () {
            this.adjustedBWRatio = 0,
                this.gender = null,
                this.onVent = null,
                this.hasTrauma = null,
                this.hasBurns = null,
                this.age = '',
                this.height = '',
                this.weight = '',
                this.temperature = '',
                this.ventRate = '',
                this.formula = '',
                this.kcalFormula = '',
                this.fluidsFormula = '',
                this.proteinFormula = '',
                this.bmiStatus = '',
                this.minFluids = 0
        }

    }
});
