<script>
    import { resolve } from "$app/paths";
    import "../app.css";
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
    documentation
</p>
<nav style="display:flex; gap: 12px; padding: 12px 0;">
    <a href={resolve("/home")}>Home</a>
    <a href={resolve("/about")}>About</a>
</nav>
<h1 class="text-3xl font-bold underline">Hello world!</h1>

<style lang="postcss">
    @reference "tailwindcss";
</style>
