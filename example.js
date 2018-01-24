Vue.component('individual-city', {
    props: ['id', 'name', 'country'],
    methods: {
        changed: function() {
            this.$emit('changed', this.id, this.name);
        }
    },
    template:
        '<span>{{name}}, {{country}} <input v-model="name" v-on:input="changed"></span>'
});

var app = new Vue({
    el: '#main',
    data: {
        cities: [
            {
                id: 1,
                name: 'Berlin',
                country: 'Germany'
            },
            {
                id: 2,
                name: 'Hamburg',
                country: 'Germany'
            }
        ]
    },
    methods: {
        updateCityName: function(id, name) {
            for (var i = 0; i < this.cities.length; i++) {
                if (this.cities[i].id == id) {
                    this.cities[i].name = name;
                    return;
                }
            }
        }
    }
});
