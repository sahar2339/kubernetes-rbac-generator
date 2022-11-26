<script>
import download from '../assets/download.svg'
import preview from '../assets/preview.svg'
import upload from '../assets/upload.svg'
import svelteIcon from '../assets/svelte.png'
import Styles from './styles.css'
import DownloadWindow from './DownloadWindow.svelte';
import Editor from './Editor.svelte';
import RoleTips from './RoleTips.svelte'
import { roleObject } from './store.js';
import Tags from "svelte-tags-input";

let showPreview;
let showDownload;
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

function generateRoleBinding()
{
  let generatedRoleObject = {
  "apiVersion":"rbac.authorization.k8s.io/v1",
  "kind":"roleBinding",
  "metadata":{
    "name":rolebindingName,
  }
}

}

function previewRole()
{
  let generatedRoleObject = generateRole()
  showPreview.show()
  yaml = jsyaml.dump(generatedRoleObject)
}

function showDownloadWindow()
{
  showDownload.show()
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
        disable={!$roleObject.clustered}
        bind:tags={$roleObject.aggregateRoles}
        />
    </div>
    <div class="buttons">
      <button on:click={showDownloadWindow} class="download blueboy"><img src={download}/> Generate </button>
      <label class="preview blueboy" ><img src={upload}/> Upload 
        <input bind:files={files} accept="text/x-yaml" style="display: none;" type="file"/>
      </label>
      <button on:click={previewRole} class="preview blueboy"><img src={preview}> Yaml</button>
  </div>
  <hr/>
  <RoleTips namespace={$roleObject.namespace} rules={rules} clusterRole={$roleObject.clustered}/>

</div>
<Editor bind:roleYaml={yaml} bind:this={showPreview}/>
<DownloadWindow bind:this={showDownload} namespace={$roleObject.namespace} clustered={$roleObject.clustered} roleName={$roleObject.name}/>
<style>
.config{
  grid-row: 2 / 3;
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


.buttons {
  display: flex;
  margin-top: 1rem;
  flex-wrap: wrap;
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

</style>