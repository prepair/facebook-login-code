(() => {
  
  const Access = {
    name: 'Access',
    data: () => ({
      token: '',
      error: ''
    }),
    created: function() {
      this.token = this.$route.params.token;
      this.onGetProfile();
    },
    methods: {
      onGetProfile: function() {
        this.reset();

        window.Facebook.api('/me', { fields: 'id,name,email' }, this.token)
          .then(response => {
            router.push({ path: '/profile', query: response })
          })
          .catch(error => {
            this.error = error.message;
          });
      },
      reset: function() {
        this.userId = '';
        this.error = '';
      }
    },
    template: `
      <div id="access">
        <!-- Access token -->
        <label for="token">Access token</label>
        <input name="token" type="text" v-model="token">

        <!-- Error message -->
        <div v-show="error" class="error">{{ error }}</div>
      </div>
    `
  };
  
  window.Components = window.Components || {};
  window.Components.Access = Access;
})();
