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
      activeCars: true,
      drawer: false,
      mini: true,
      dialog: false,
      brokeDialog: false,
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
      if (this.location === this.locations[1].text) {
        alert(this.location + ' (Conneticut) Information is not prepared yet, so we will show NC data for now')
        this.location = 'NC'
      }
    }
  },
  methods: {
    loadCars(x) {
      fetch(server + `/${this.location.toLowerCase()}/cars`)
        .then(resp => resp.json())
        .then(data => {
          if (data[2] == undefined) {
            this.brokeDialog = true
          }
          this.data.cars = data
          if (x) x()
        })
    },
    loadNeeds() {
      fetch(server + `/${this.location.toLowerCase()}/needs`)
        .then(resp => resp.json())
        .then(data => {
          data.forEach(x => x.checkItems.forEach(x => x.checked = false)) // Checkbox's model
          data.forEach(l => {
            var relatedCar = this.data.cars.find(car => car.id == l.idCard)
            l.name = relatedCar ? relatedCar.name : 'Supplies List'
          })
          this.data.needs = data
        })
    },
    checkItem(id, idCard) {
      // Gets the associated card, or the last card (which is the supplies list)
      var checkListReference = this.data.needs.find(x => x.id === idCard) || this.data.needs.slice(-1)[0]
      var needChecked = checkListReference.checkItems.find(x => x.id === id).checked
      var state = needChecked ? 'complete' : 'incomplete'
      var url = server + `/${this.location.toLowerCase()}/check?loc=${this.location.toLowerCase()}&state=${state}&idCard=${idCard}&checkitemId=${id}`
      console.log(url)
      fetch(url).then(resp => console.log(resp.json()))
    }
  }
}).$mount('#app')

// Application Init
V.loadCars(V.loadNeeds)
