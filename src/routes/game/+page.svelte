<script lang="ts">
    import { onMount } from "svelte";
    import { game } from "$lib/game/game";
    onMount(async () => {
        await game.startNewGame();
    });
</script>

<div id="game-container"></div>
<div id="inventory"></div>
