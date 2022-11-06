<script>
    import CodeMirror from "svelte-codemirror-editor";
    import { yaml } from "@codemirror/legacy-modes/mode/yaml";
    export let roleYaml;
    let shown;

    export function show()
    {
        shown = true;
    }

    function hide()
    {
        shown = false;
    }
</script>

{#if shown}
<div  class="rolePreview">
    <button on:click={hide}>close</button>
    <CodeMirror bind:roleYaml lang={yaml} />
</div>
{/if}

<style>
    .rolePreview {
        display: flex;
        position: absolute;
        flex-direction: column;
        top:10rem;
        left: 50%;
        transform: translate(-50%);
        width: 45rem;
        height: 55rem;
        z-index: 1000;
        color: white;
        background-color: black;      
    }

    .rolePreview pre{
        height: 100%;
    }


</style>