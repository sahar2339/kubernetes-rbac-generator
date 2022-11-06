<script>
import download from '../assets/download.svg'
import preview from '../assets/preview.svg'
import upload from '../assets/upload.svg'
import svelteIcon from '../assets/svelte.png'
import Editor from './Editor.svelte';
import RoleTips from './RoleTips.svelte'
import { roleObject } from './store.js';
import Tags from "svelte-tags-input";

let showPreview;
let yaml;
let files;
export let rules; 

$: {
  if(files)
  {
    loadRole(files[0])
  }
}



function generateRole(){
  let generatedRoleObject = 
  {
  "apiVersion":"rbac.authorization.k8s.io/v1",
  "kind":"ClusterRole",
  "metadata":{
    "name":$roleObject.name,
  }
}
  if($roleObject.aggregateRoles.length > 0)
  {
    let labels = {}
    Array.from($roleObject.aggregateRoles).forEach((role) => {
      labels["rbac.authorization.k8s.io/aggregate-to-"+role] = "true"
    })
    generatedRoleObject["metadata"]["labels"] = labels
}
  if(!$roleObject.clustered)
  {
    generatedRoleObject["kind"] = "Role";
    generatedRoleObject["metadata"]["namespace"] = $roleObject.namespace;
  }
  generatedRoleObject["rules"] = rules;
  return generatedRoleObject

}

function previewRole()
{
  let generatedRoleObject = generateRole()
  showPreview.show()
  yaml = jsyaml.dump(generatedRoleObject)
}

function loadRole(file)
{
  file.text().then((yaml) => {
    let generatedRoleObject = jsyaml.load(yaml);
    if(generatedRoleObject["kind"] == "ClusterRole")
    {
      $roleObject.clustered = true;
    }
    else
    {
      $roleObject.clustered = false;
      $roleObject.namespace = generatedRoleObject["metadata"]["namespace"]
    }
    $roleObject.name = generatedRoleObject["metadata"]["name"]
    rules = generatedRoleObject["rules"].slice()
  })
}

function downloadRole()
{
  let generatedRoleObject = generateRole()
  let dataStr = "data:text/x-yaml;charset=utf-8," + encodeURIComponent(jsyaml.dump(generatedRoleObject));
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", $roleObject.name + ".yaml");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove()
}


</script>
<svelte:head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js" integrity="sha512-CSBhVREyzHAjAFfBlIBakjoRUKp5h7VSweP0InR/pAJyptH7peuhCsqAI/snV+TwZmXZqoUklpXp6R6wMnYf5Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</svelte:head>

<div class="config">
    <div>
      <label class="switch">
        <input bind:checked={$roleObject.clustered} class="clusterRole-toggle" type="checkbox">
        <span class="slider"></span>
        <p>Cluster Scoped Rule</p>
      </label>
     <br>
    </div>
    <div>
        <label for="namespace">Namespace:</label><br>
        <input bind:value={$roleObject.namespace} disabled={$roleObject.clustered} class="namespace" name="namespace" type=text><br>
        <label for="rolename">Role name:</label><br>
        <input  class="rolename" bind:value={$roleObject.name} name="rolename" type=text><br>
        <label for="aggregate">Aggregate roles:</label>
        <Tags
        name="aggregate"
        bind:tags={$roleObject.aggregateRoles}
        />
    </div>
    <div class="buttons">
      <button on:click={downloadRole} class="download blueboy"><img src={download}/> Download </button>
      <label class="preview blueboy" ><img src={upload}/> Upload 
        <input bind:files={files} accept="text/x-yaml" style="display: none;" type="file"/>
      </label>
      <button on:click={previewRole} class="preview blueboy"><img src={preview}> Yaml</button>
  </div>
  <hr/>
  <RoleTips namespace={$roleObject.namespace} rules={rules} clusterRole={$roleObject.clustered}/>

</div>
<Editor bind:roleYaml={yaml} bind:this={showPreview}/>
<style>
.config{
    font-family: Rubik;
    background: var(--default-wiget-background);
    display: flex;
    height: 100%;
    flex-direction: column;
    box-sizing: border-box;
    color: black;
    box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
}

.config p{
    display: block;
}

hr{
  margin: 2rem 0;
}


:global(.config > *){
    margin: 0.5rem 1rem;
}


.blueboy{
    color: white;
    margin: 0.5rem 1rem 0.2rem 0;
    border:none;
    border-radius: 12px;
    display: flex;
    width: fit-content;
    align-items: center;
    background: var(--default-background-menu);
    font-size: 1rem;
    padding: 0.6rem 1.5rem 0.6rem 0.8rem;
}

.blueboy:hover{
  background-color: #0063b4;
  transition-duration: 0.4s;
}

.blueboy img{
  height: 1.4rem;
  margin-right: 0.3rem;
}

.buttons {
  display: flex;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.blueboy:hover{
    cursor: pointer;
}

.config input[type=text]{
    padding: 0.6rem 0.4rem;
    padding-left: 1rem;
    font-size: var(--default-text);
    background-color: white;
    border-radius: 8px;
    margin-bottom: 0.8rem;
    color: black;
    border: 1px solid rgb(204, 204, 204);
}

.config :global(.svelte-tags-input-layout){
  border-radius: 8px;
  width: 13rem;

}
input:focus{
    outline: none;
}
:global(:disabled){
  background-color: rgb(233, 229, 229) !important;
}


.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    margin-top: 0.4rem;
    scale: 0.7;
    height: 34px;
  }

  .switch p{
    position: absolute;
    top:50%;
    left:100%;
    font-size: 1.4rem;
    margin: 0 0.8rem;
    width: max-content;
    transform: translate(0,-50%);
  }
  
  .switch input { 
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 34px;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    border-radius: 50%;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }
  
  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
  
</style>