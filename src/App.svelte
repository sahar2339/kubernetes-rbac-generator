<script>
  import fonts from './lib/fonts.css'
  import Controls from './lib/Controls.svelte'
  import Rule from './lib/Rule.svelte'
  import {roleObject} from './lib/store'
 
  function addRule()
  {
    $roleObject.rules = $roleObject.rules.concat({
    "apiGroups":[],
    "resources": [],
    "resourceNames": [],
    "verbs": []
  })
  }

  function addRuleFromObject(index)
  {
    let copy = structuredClone($roleObject.rules[index])
    $roleObject.rules.splice(index,0,copy)
    $roleObject.rules = $roleObject.rules

  }


  export const deleteRule =(index) => {
    if($roleObject.rules.length == 1)
      {
        return;
      }
      $roleObject.rules.splice(index, 1)
		$roleObject.rules = $roleObject.rules;
  }


</script>

<main>
<div class="layout">
  <div class="header">
    <h1 class="header-text">Kubernetes - RBAC - Generator</h1>
</div>
<Controls bind:rules={$roleObject.rules}/>
<div class="rules-container">
<div class="rules-header"><h2>{$roleObject.rules.length} Rules</h2></div>
<div class="rulesWrapper">
{#each $roleObject.rules as rule, index}
  <Rule bind:apiVersions={rule.apiGroups} bind:kinds={rule.resources} bind:names={rule.resourceNames} bind:verbs={rule.verbs} deleteRule={deleteRule} duplicateRule={addRuleFromObject} index={index} />
{/each}
<div class="add-rule"><button on:click="{addRule}"></button></div>
</div>
</div>
<span class="made-with-svelte"><a target="_blank" href="https://svelte.dev/">Made with Svelte <span style="color:red;">❤</span></a></span>
</div>
</main>

<style>

:global(:root) {
    --default-text: 1rem;
    --default-headers: 1.5rem;
    --default-color-text: white;
    --default-color-headers: white;
    --default-background-menu: #326de6;
    --default-wiget-background: white;
    --default-background:rgba(249, 250, 254, 1);
    --defult-lines-color: #d1d1d1; 
  }

  :global(a)
  {
    color:white;
    text-decoration: none;
  }

.layout{
  display: grid;
  grid-template-columns: 350px auto;
  grid-template-rows: 60px auto 25px;
  height: 100vh;
  width: 100vw;
}

.darkMode{
    --default-color-text: #d3d1d1;
    --default-color-headers: #f3f0f0; 
    --default-background-menu: #000212;
    --defult-lines-color:#5e5e5e;
}

.made-with-svelte{
  grid-column: 1 / 3;
  grid-row: 3 / 4;
  background: rgb(31, 31, 31);
  display: flex;
  color: white;
  font-family: Rubik;
  font-size: 0.8rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.add-rule{
  width:100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dotted rgba(145, 145, 145,0.4);
}

.add-rule button{
  background-image: url('./assets/plus.svg');
  background-position: 50% 50%;
  height: 10rem;
  width: 100%;
  opacity: 0.3;
  border: none;
  background-color: transparent;
  background-repeat: no-repeat;
}

.rulesWrapper{
  height: auto;
  overflow-y: scroll;
  overflow-x: visible;
  padding: 1rem;
  height: 60vh;
  flex-basis: 80rem;
  padding-bottom: 15rem;

}

.add-rule button:hover{
  cursor: pointer;
  background-color: rgba(0,0,0,0.05);
}

:global(*){
    padding: 0;
    margin: 0;
}

:global(body){
    background-color: var(--default-background);
}

.header-text{
    font-family: Rubik;
    font-weight: lighter;
    font-size: var(--default-headers);
    color: var(--default-color-headers);
    text-align: center;
}

.header{
    box-shadow: rgba(0, 0, 0, 0.35) -4px 2px 5px 0px, rgba(0, 0, 0, 0.05) -1px 1px 1px 0px;
    height: 60px;
    grid-row: 1 / 2;
    grid-column: 1 / 3;
    width: 100vw;
    display: flex;
    align-items: center;
    background-color: var(--default-background-menu);
    justify-content: center;
}

.rules-container{
    display: flex;
    margin: auto;
    grid-row: 2 / 3;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    grid-column: 2/ 3;
    margin-top: 2rem;
}

.rules-header{
  background-color: var(--default-wiget-background);
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
  font-family: Rubik;
  margin: 1rem;
  display: flex;
  flex-basis: 80rem;
  justify-content: center;
  align-items: center;
  box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
}

:global(.rulesWrapper)
{
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

:global(.rulesWrapper::-webkit-scrollbar)
{
  display: none;
}
</style>
