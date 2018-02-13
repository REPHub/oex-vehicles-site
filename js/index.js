// Initialize Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err)
    })
  })
}

window.addEventListener('load', function() {
  function updateOnlineStatus(event) {
    if (navigator.onLine) {
      // handle online status
      console.log('online');
    } else {
      // handle offline status
      console.log('offline');
      alert('Just Wanted to inform you, that you are offline. As of this moment, a connection is needed to get the newest vehicle data.')
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

const server = 'https://oex2.glitch.me'
const V = new Vue({
  data () {
    return {
      location: (() => (localStorage['location'] == undefined) ? 'NC' : localStorage['location'])(),
      locations: [
        { text: 'NC' },
        { text: 'VA' },
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
      localStorage['location'] = this.location
      if (this.location === "CT") {
        alert(this.location + ' (Conneticut) Information is not prepared yet, so we cannot show its data for now')
        this.location = localStorage['location']
      } else {
        V.init()
      }
    }
  },
  methods: {
    loadCars (x) {
      fetch(server + `/${this.location.toLowerCase()}/cars`)
        .then(resp => resp.json())
        .then(data => {
          if (data[2] === undefined) {
            this.brokeDialog = true
          }
          this.data.cars = data
          if (x) x()
        })
    },
    loadNeeds () {
      fetch(server + `/${this.location.toLowerCase()}/needs`)
        .then(resp => resp.json())
        .then(data => {
          data.forEach(x => x.checkItems.forEach(x => x.checked = false)) // Checkbox's model
          data.forEach(l => {
            var relatedCar = this.data.cars.find(car => car.id === l.idCard)
            l.name = relatedCar ? relatedCar.name : 'Supplies List'
          })
          this.data.needs = data
        })
    },
    checkItem (id, idCard) {
      // Gets the associated card, or the last card (which is the supplies list)
      var checkListReference = this.data.needs.find(x => x.id === idCard) || this.data.needs.slice(-1)[0]
      var needChecked = checkListReference.checkItems.find(x => x.id === id).checked
      var state = needChecked ? 'complete' : 'incomplete'
      var url = server + `/${this.location.toLowerCase()}/check?loc=${this.location.toLowerCase()}&state=${state}&idCard=${idCard}&checkitemId=${id}`
      console.log(url)
      fetch(url).then(resp => console.log(resp.json()))
    },
    init() {
      V.loadCars(V.loadNeeds)
    }
  }
}).$mount('#app')

// Application Init
V.init()
