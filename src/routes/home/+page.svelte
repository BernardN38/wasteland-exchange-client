<script lang="ts">
    import { game } from "$lib/game/game";
</script>

<div
    class="flex flex-col items-center justify-center min-h-screen py-2 .button-group space-y-1"
>
    <h1>Wasteland Exchange</h1>
    <div>
        <a href="/client/game"> <button class="btn">New Game</button> </a>
    </div>
    <div><button class="btn">Load Game</button></div>
    <div><button class="btn">Settings</button></div>
    <div><button class="btn">Exit</button></div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
</style>
