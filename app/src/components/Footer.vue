<script setup lang="ts">
</script>

<template>
  <footer class="footer border-top p-2">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-md-6">
          <img src="../assets/llamita02.png" class="img-fluid" style="width: auto; height: 90px;">
        </div>
        <div class="col-md-6 text-end">
          <p class="text-muted">Desarrollado por @JuampaCamarda</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #fff;
}
@media (max-width: 767px) {
  .footer img {
    display: block;
    margin: auto;
    width: 60px;
  }
  .col-md-6.text-end {
    text-align: center !important;
    margin-top: 10px;
  }
}
</style>