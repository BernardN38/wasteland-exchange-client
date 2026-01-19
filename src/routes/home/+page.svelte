<script lang="ts">
    fetch("https://dev.bernardn.com/api/health").then((res) => {
        if (!res.ok) {
            console.error("API health check failed");
        } else {
            console.log(res.body);
        }
    });
</script>

<h1>Home</h1>
<p>This is /home</p>
