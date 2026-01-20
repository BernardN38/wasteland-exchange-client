<script>
    import { resolve } from "$app/paths";
    import "../app.css";
</script>

<nav style="display:flex; gap: 12px; padding: 12px 0;">
    <a href={resolve("/home")}>Home</a>
</nav>

<style lang="postcss">
    @reference "tailwindcss";
</style>
