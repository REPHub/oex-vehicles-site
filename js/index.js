// Initialize Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err)
    })
  })
}

const server = 'https://oex.glitch.me'
const V = new Vue({
  data() {
    return {
      location: 'NC',
      locations: [
        { text: 'NC' },
        { text: 'CT' }
      ],
      title: 'Vehicle Status',
      data: { cars: null, needs: null },
      activeCars: false,
      drawer: false,
      mini: true,
      dialog: false,
      navItems: [
        {
          title: 'Vehicles',
          icon: 'directions_car',
          function: () => {
            V.loadCars()
            V.activeCars = true
            V.drawer = false
          }
        },
        {
          title: 'Needs',
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
        },
        {
          title: 'Shop Supplies',
          icon: 'build',
          href: 'https://trello.com/c/VdYyLUDh/5-materials-needed'
        }
      ]
    }
  },
  computed: {
    locationTitle: function () {
      return this.title + ' ' + this.location
    }
  },
  watch: {
    // whenever question changes, this function will run
    location: function () {
      if (this.location === 'CT') {
        alert(this.location + ' (Conneticut) Information is not prepared yet, so we will show NC data for now')
      }
    }
  },
  methods: {
    loadCars(x) {
      fetch(server + `/${this.location.toLowerCase()}/cars`)
        .then(resp => resp.json())
        .then(data => {
          this.data.cars = data
          if (x) x()
        })
    },
    loadNeeds() {
      fetch(server + `/${this.location.toLowerCase()}/needs`)
        .then(resp => resp.json())
        .then(data => {
          data.forEach(x => x.checked = false) // Checkbox's modle
          var nestedList = []
          this.data.cars.forEach(car => {
            var carNeeds = { name: car.name, id: car.id, needs: [] }
            carNeeds.needs = data.filter(need => need.cardId === car.id)
            if (carNeeds.needs.length !== 0) nestedList.push(carNeeds)
          })
          // This Is the supplies list list
          nestedList.push({ name: 'Shop Supplies', id: '', needs: data.filter(need => need.cardId === '5a15e520c678987acecd583f') })
          this.data.needs = nestedList // Inset into data store
        })
    },
    checkItem(id, cardId) {
      // Gets the associated card, or the last card (which is the supplies list)
      var cardReference = this.data.needs.find(x => x.id === cardId) || this.data.slice(-1)[0]
      var needChecked = cardReference.needs.find(x => x.id === id).checked
      var state = needChecked ? 'complete' : 'incomplete'
      var url = server + `/${this.location.toLowerCase()}/check?loc=${this.location.toLowerCase()}&state=${state}&cardId=${cardId}&checkitemId=${id}`
      console.log(url)
      fetch(url).then(resp => console.log(resp.json()))
    }
  }
}).$mount('#app')

// Application Init
V.loadCars(V.loadNeeds)
