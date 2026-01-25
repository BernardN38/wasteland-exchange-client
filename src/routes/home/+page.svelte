<script lang="ts">
    import { Game } from "$lib/game/game";
    const game = new Game();
</script>

<div
    class="flex flex-col items-center justify-center min-h-screen py-2 .button-group space-y-1"
>
    <h1>Wasteland Exchange</h1>
    <div>
        <button onclick={async () => await game.startNewGame()} class="btn"><a href="/client/game">New Game</a></button
        >
    </div>
    <div><button class="btn" >Load Game</button></div>
    <div><button class="btn">Settings</button></div>
    <div><button class="btn">Exit</button></div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
</style>
