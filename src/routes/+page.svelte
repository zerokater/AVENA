<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let pdfUrl = '';
  let reinigung = 'MRDTOF34';
  let name = 'Fatbardh Berisha';
  let adresse = 'Teststrasse 5';
  let plz = '3900 Brig';
  let mwst = false;

  let items = [
    { title: 'Reinigung 2.5 Zimmer-Wohnung', qty: 1, price: 0 }
  ];

  function addItem() {
    items = [...items, { title: '', qty: 1, price: 0 }];
  }

  function removeItem(i: number) {
    items = items.filter((_, index) => index !== i);
  }

  function total() {
    return items.reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function mwstBetrag() {
    return mwst ? total() * 0.081 : 0;
  }

  function totalMitMwst() {
    return total() + mwstBetrag();
  }

  async function updatePreview() {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offertnummer: reinigung,
        name,
        adresse,
        plz,
        items,
        mwst
      })
    });

    if (!res.ok) {
      console.error('PDF-Generierung fehlgeschlagen');
      return;
    }

    const blob = await res.blob();
    pdfUrl = URL.createObjectURL(blob);
  }

  onMount(() => {
    updatePreview();
  });
</script>

<style>
  .flex-container {
    display: flex;
    gap: 1rem;
  }
  .left-panel {
    width: 300px;
  }
  .right-panel {
    flex: 1;
  }
  input, select {
    display: block;
    margin-bottom: 0.5rem;
    width: 100%;
  }
  .item-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }
  .item-row input, .item-row select {
    flex: 1;
  }
</style>

<div class="flex-container">
  <div class="left-panel">
    <label>REINIGUNG NR:<input bind:value={reinigung} /></label>
    <label>Vorname Name:<input bind:value={name} /></label>
    <label>Adresse:<input bind:value={adresse} /></label>
    <label>PLZ:<input bind:value={plz} /></label>

    {#each items as item, i}
      <div class="item-row">
        <input type="text" list={`options-${i}`} bind:value={item.title} placeholder="Bezeichnung" />
        <datalist id={`options-${i}`}>
          <option value="Reinigung 2.5 Zimmer-Wohnung" />
          <option value="Reinigung 3.5 Zimmer-Wohnung" />
          <option value="Reinigung 4.5 Zimmer-Wohnung" />
          <option value="Reinigung 5.5 Zimmer-Wohnung" />
        </datalist>
        <input type="number" min="1" bind:value={item.qty} placeholder="Menge" />
        <input type="number" step="0.01" min="0" bind:value={item.price} placeholder="Preis" />
        <span>Fr. {(item.qty * item.price).toFixed(2)}</span>
        <button on:click={() => removeItem(i)}>✕</button>
      </div>
    {/each}

    <button on:click={addItem}>+ Artikel</button>

    <label><input type="checkbox" bind:checked={mwst} /> MwSt. 8.1%</label>
    <p>Zwischensumme: Fr. {total().toFixed(2)}</p>
    {#if mwst}
      <p>+ MwSt (8.1%): Fr. {mwstBetrag().toFixed(2)}</p>
    {/if}
    <p><strong>Total: Fr. {totalMitMwst().toFixed(2)}</strong></p>

    <button on:click={updatePreview}>Vorschau aktualisieren</button>
  </div>

  <div class="right-panel">
    {#if pdfUrl}
      <iframe
        title="Live PDF Vorschau"
        src={pdfUrl}
        style="width: 100%; height: 100vh; border: none;"
      ></iframe>
    {/if}
  </div>
</div>
