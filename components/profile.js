(() => {
  
  const Profile = {
    name: 'Profile',
    data: () => ({
      id: '',
      name: '',
      email: ''
    }),
    created: function() {
      const query = this.$route.query;
      this.id = query.id;
      this.name = query.name;
      this.email = query.email;
    },
    template: `
      <div id="profile">
        <!-- User ID -->
        <label for="user-id">User ID</label>
        <input name="user-id" type="text" v-model="id">

        <!-- User Name -->
        <label for="user-name">User name</label>
        <input name="user-name" type="text" v-model="name">

        <!-- User Email -->
        <label for="user-email">User email</label>
        <input name="user-email" type="text" v-model="email">
      </div>
    `
  };
  
  window.Components = window.Components || {};
  window.Components.Profile = Profile;
})();
