const V = new Vue({
  el: '#app',
  data() {
    return {
      data: {
        cars: null,
        needs: null
      },
      activeCars: true,
      dialog: false,
      drawer: false,
      mini: true,
      navItems: [
        {
          title: 'NC Cars',
          icon: 'directions_car',
          function: () => {
            console.log('Looking at Cars')
            V.loadCars()
            V.activeCars = true
            V.drawer = false
          }
        },
        {
          title: 'NC Needs',
          icon: 'shopping_cart',
          function: () => {
            console.log('Looking at Needs')
            V.loadNeeds()
            V.activeCars = false
            V.drawer = false
          }
        },
        {
          title: 'Informaton',
          icon: 'info',
          function: () => {
            console.log('Looking at Info')
            V.dialog = true
            V.drawer = false
          }
        },
        
      ]
    }
  },
  methods: {
    loadCars(x) {
      fetch('https://oex.glitch.me/nc/cars')
        .then(resp => resp.json())
        .then(data => this.data.cars = data)
        .then(() => { if (x) x() })
    },
    loadNeeds() {
      fetch('https://oex.glitch.me/nc/needs')
        .then(resp => resp.json())
        .then(data => {
          // Add Checkbox model
          data.forEach(x => x.checked = false)
          // Get the Lists and put them under their cars
          var nestedList = []
          this.data.cars.forEach(car => {
            var carNeeds = { name: car.name, id: car.id, needs: [] }
            carNeeds.needs = data.filter(need => need.cardId === car.id)
            if (carNeeds.needs.length != 0) nestedList.push(carNeeds)
          })
          // This Is the supplies list list
          nestedList.push({ name: 'Shop Supplies', id: '', needs: data.filter(need => need.cardId === '5a15e520c678987acecd583f') })
          // Set it to the data
          this.data.needs = nestedList
        })
    },
    checkItem(id, cardId) {
      var loc = 'nc'
      var cardReference = this.data.needs.find(x => x.id === cardId) || this.data.needs[this.data.needs.length - 1]
      var needChecked = cardReference.needs.find(x => x.id === id).checked
      var state = needChecked ? 'complete' : 'incomplete'
      console.log(state)
      var url = `https://oex.glitch.me/nc/check?loc=${loc}&state=${state}&cardId=${cardId}&checkitemId=${id}`
      fetch(url).then(resp => console.log(resp.json()))
    }
  }
})

// Application Init
V.loadCars(V.loadNeeds)
