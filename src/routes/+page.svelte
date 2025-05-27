<script lang="ts">
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

  async function downloadPDF() {
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
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${reinigung}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Fehler bei fetch:', e);
    }
  }

  // async function updatePreview() {
  //   try {
  //     const res = await fetch('/preview', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         offertnummer: reinigung,
  //         name,
  //         adresse,
  //         plz,
  //         items,
  //         mwst
  //       })
  //     });

  //     if (!res.ok) {
  //       const errText = await res.text();
  //       console.error('PDF-Generierung fehlgeschlagen:', errText);
  //       return;
  //     }

  //     const blob = await res.blob();
  //     pdfUrl = URL.createObjectURL(blob);
  //   } catch (e) {
  //     console.error('Fehler bei fetch:', e);
  //   }
  // }

  // onMount(() => {
  //   updatePreview();
  // });
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #f5f7fa;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-wrapper {
    background-color: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #333;
  }

  input, select {
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  button {
    background-color: #0175ff;
    color: white;
    border: none;
    padding: 0.75rem 1.2rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
    width: 100%;
    box-sizing: border-box;
  }

  button:hover {
    background-color: #0160d1;
  }

  .leistungen-section {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid #ddd;
  }

  .leistungen-title {
    font-size: 1rem;
    font-weight: bold;
    color: #0175ff;
    margin-bottom: 1rem;
  }

  .item-row {
    display: grid;
    grid-template-columns: 1fr 80px 100px auto;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .item-row input {
    width: 100%;
  }

  .item-row button {
    background-color: #e74c3c;
    border: none;
    padding: 0.5rem 0.8rem;
    border-radius: 6px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    width: 100%;
    max-width: 40px;
    text-align: center;
  }

  .item-row button:hover {
    background-color: #c0392b;
  }

  .totals {
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    padding-top: 1rem;
    font-size: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .checkbox-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 480px) {
    .form-wrapper {
      padding: 1.5rem;
    }

    .item-row {
      grid-template-columns: 1fr;
    }

    .item-row button {
      max-width: none;
      width: 100%;
      margin-top: 0.5rem;
    }
  }
</style>



<div class="form-wrapper">
  <div class="form-group">
    <label>OFFERTE NR:</label>
    <input bind:value={reinigung} />

    <label>Vorname Name:</label>
    <input bind:value={name} />

    <label>Adresse:</label>
    <input bind:value={adresse} />

    <label>PLZ:</label>
    <input bind:value={plz} />
  </div>

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

<div class="checkbox-label">
  <input type="checkbox" bind:checked={mwst} />
  <span>MwSt. 8.1%</span>
</div>


  <div class="totals">
    <p>Zwischensumme: Fr. {total().toFixed(2)}</p>
    {#if mwst}
      <p>+ MwSt (8.1%): Fr. {mwstBetrag().toFixed(2)}</p>
    {/if}
    <p><strong>Total: Fr. {totalMitMwst().toFixed(2)}</strong></p>
  </div>

  <button on:click={downloadPDF}>PDF herunterladen</button>
</div>
