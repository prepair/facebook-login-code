(() => {

  const Home = {
    name: 'Home',
    data: () => ({
      code: '',
      state: '',
      error: ''
    }),
    methods: {
      onLogin: function() {
        this.reset();

        window.Facebook.login()
          .then(response => {
            this.code = response.code;
            this.state = response.state;
          })
          .catch(error => {
            this.error = error.message;
          });
      },
      reset: function() {
        this.code = '';
        this.state = '';
        this.error = '';
      }
    },
    template: `
      <div id="home">
        <button @click="onLogin()">Login with Facebook</button>
        
        <!-- Error message -->
        <div v-show="error" class="error">{{ error }}</div>
  
        <!-- Code & State -->
        <label for="code">Code</label>
        <input name="code" type="text" @click="$event.target.select()" v-model="code">
        <label for="state">State</label>
        <input name="state" type="text" @click="$event.target.select()" v-model="state">
      </div>
    `
  };

  window.Components = window.Components || {};
  window.Components.Home = Home;
})();
