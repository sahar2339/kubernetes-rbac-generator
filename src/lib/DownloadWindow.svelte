<script>
    import download from '../assets/download.svg'
    import plus from '../assets/plus.svg'
    import deleteIcon from '../assets/x.svg'

    let subjects = [{"name":"sahar", "type":"group"}];
    export let namespace;
    export let clustered;
    export let roleName;
    let shown  = false;

        export function show()
        {
             shown = true;
        }

        function hide()
        {
            shown = false;
        }

        function addSubject()
        {
            subjects.push({"type":"user","name":""})
            subjects = subjects
        }
        function removeSubject(index)
        {
            if(subjects.length == 1)
                return
            subjects.splice(index,1)
            subjects = subjects
        }
</script>

{#if shown}
<div on:click={hide} class="backgroundCover"></div>
<div class="downloadWindow">
    <div class="role section">
        <button class="blueboy"><img src={download}/> Download role </button>
    </div>
    <div class="roleBinding section">
        <label for="name">Name :</label><br>
        <input  value={roleName+"-binding"} name="name" type="text"><br>
        <label class="switch">
            <input class="clusterRole-toggle" type="checkbox">
            <span class="slider"></span>
            <p>Cluster scoped binding</p>
          </label>
        <label for="namespace">Namespace :</label><br>
        <input disabled={clustered} value={namespace} name="namespace" type="text"><br>
        <span>Subjects: </span><br>
        {#each subjects as subject, id}
            <div class="subjectSelection">
                <select bind:value={subject.type}>
                    <option value="user">User</option>
                    <option value="group">Group</option>
                    <option value="serviceaccount">ServiceAccount</option>
                </select>
                <input bind:value={subject.name} type="text">
                <button on:click={() => {removeSubject(id)}}><img src={deleteIcon}></button>
            </div>
        {/each}
        <button on:click={addSubject}><img src={plus}></button>
        <button class="blueboy"><img src={download}/> Download roleBinding </button>
    </div>
</div>
{/if}

<style>
    :global(.downloadWindow){
        display: flex;
        background-color: var(--default-wiget-background);
        position: absolute;
        top: 50%;
        z-index: 10000;
        padding: 1rem;
        width: 55rem;
        height: 30rem;
        border-radius: 12px;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    :global(.backgroundCover){
        position: fixed;
        height: 100vh;
        z-index: 1000;
        width: 100vw;
        background-color: black;
        opacity: 0.6;
    }
    .section{
        display: flex;
        overflow-y: scroll;
        justify-content: baseline;     
        flex-wrap: nowrap;
        flex-direction: column;
        flex-basis: 50%;
    }
    .section:first-child{
        border-right: 1px solid rgb(200, 200, 200);
        justify-content: center;
        align-items: center;
    }
</style>