const server = 'https://oex.glitch.me'
const V = new Vue({
  data() {
    return {
      data: { cars: null, needs: null },
      activeCars: true,
      drawer: false,
      mini: true,
      dialog: false,
      navItems: [
        {
          title: 'NC Cars',
          icon: 'directions_car',
          function: () => {
            V.loadCars()
            V.activeCars = true
            V.drawer = false
          }
        },
        {
          title: 'NC Needs',
          icon: 'shopping_cart',
          function: () => {
            V.loadNeeds()
            V.activeCars = false
            V.drawer = false
          }
        },
        {
          title: 'Informaton',
          icon: 'info',
          function: () => {
            V.dialog = true
            V.drawer = false
          }
        }

      ]
    }
  },
  methods: {
    loadCars(x) {
      fetch(server + '/nc/cars')
        .then(resp => resp.json())
        .then(data => {
          this.data.cars = data
          if (x) x()
        })
    },
    loadNeeds() {
      fetch(server + '/nc/needs')
        .then(resp => resp.json())
        .then(data => {
          // Add Checkbox model
          data.forEach(x => x.checked = false)
          // Get the Lists and put them under their cars
          var nestedList = []
          this.data.cars.forEach(car => {
            var carNeeds = { name: car.name, id: car.id, needs: [] }
            carNeeds.needs = data.filter(need => need.cardId === car.id)
            if (carNeeds.needs.length !== 0) nestedList.push(carNeeds)
          })
          // This Is the supplies list list
          nestedList.push({ name: 'Shop Supplies', id: '', needs: data.filter(need => need.cardId === '5a15e520c678987acecd583f') })
          // Set it to the data
          this.data.needs = nestedList
        })
    },
    checkItem(id, cardId) {
      var loc = 'nc'
      // Currently Gets the correct card, or the last card which is the supplies list
      var cardReference = this.data.needs.find(x => x.id === cardId) || this.data.needs[this.data.needs.length - 1]
      var needChecked = cardReference.needs.find(x => x.id === id).checked
      var state = needChecked ? 'complete' : 'incomplete'
      var url = server + `/nc/check?loc=${loc}&state=${state}&cardId=${cardId}&checkitemId=${id}`
      console.log(url)
      fetch(url).then(resp => console.log(resp.json()))
    }
  }
}).$mount('#app')

// Application Init
V.loadCars(V.loadNeeds)
