<template>
  <div>
    <app-navbar></app-navbar>
  </div>
</template>

<script>
    import Navbar from './components/navbar.vue';

    export default {
        name: 'app',

        components: {
            appNavbar: Navbar,
        },

    }
</script>

<style lang="scss">

</style>
