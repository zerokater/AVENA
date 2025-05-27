<script lang="ts">
  import { onMount } from 'svelte';

  let pdfUrl = '';
  let reinigung = 'MRDTOF34';
  let name = 'Fatbardh Berisha';
  let adresse = 'Teststrasse 5';
  let plz = '3900 Brig';
  let mwst = false;

  let items = [
    { title: 'Reinigung 2.5 Zimmer-Wohnung', qty: 1, price: 10 }
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
    try {
      const res = await fetch('/preview', {
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
        const errText = await res.text();
        console.error('PDF-Generierung fehlgeschlagen:', errText);
        return;
      }

      const blob = await res.blob();
      pdfUrl = URL.createObjectURL(blob);
    } catch (e) {
      console.error('Fehler bei fetch:', e);
    }
  }

  onMount(() => {
    updatePreview();
  });
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Arial', sans-serif;
  }

  .flex-container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
  }

  @media(min-width: 768px) {
    .flex-container {
      flex-direction: row;
    }
  }

  .left-panel {
    flex: 1;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .right-panel {
    flex: 2;
  }

  input, select, label, button {
    font-size: 1rem;
  }

  input, select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
  }

  button {
    background-color: #333;
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #555;
  }

  .leistungen-section {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .leistungen-title {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    color: #0175ff;
    font-weight: bold;
  }

  .item-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .item-row input {
    flex: 1 1 100px;
    min-width: 80px;
  }

  .item-row button {
    background-color: #e74c3c;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .item-row button:hover {
    background-color: #c0392b;
  }

  .totals {
    margin-top: 1rem;
    border-top: 1px solid #ccc;
    padding-top: 1rem;
  }

  iframe {
    width: 100%;
    height: 80vh;
    border: none;
  }
</style>

<div class="flex-container">
  <div class="left-panel">
    <label>REINIGUNG NR:<input bind:value={reinigung} /></label>
    <label>Vorname Name:<input bind:value={name} /></label>
    <label>Adresse:<input bind:value={adresse} /></label>
    <label>PLZ:<input bind:value={plz} /></label>

    <div class="leistungen-section">
      <div class="leistungen-title">Leistungen</div>
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
          <button on:click={() => removeItem(i)}>✕</button>
        </div>
      {/each}
      <button on:click={addItem}>+ Artikel</button>
    </div>

    <label><input type="checkbox" bind:checked={mwst} /> MwSt. 8.1%</label>

    <div class="totals">
      <p>Zwischensumme: Fr. {total().toFixed(2)}</p>
      {#if mwst}
        <p>+ MwSt (8.1%): Fr. {mwstBetrag().toFixed(2)}</p>
      {/if}
      <p><strong>Total: Fr. {totalMitMwst().toFixed(2)}</strong></p>
    </div>

    <button on:click={updatePreview}>Vorschau aktualisieren</button>
  </div>

  <div class="right-panel">
    {#if pdfUrl}
      <iframe title="Live PDF Vorschau" src={pdfUrl}></iframe>
    {/if}
  </div>
</div>
