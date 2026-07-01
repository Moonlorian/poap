import { formatDate } from '@/utils/dates';
import { getEmblemDate } from '@/utils/emblemDates';

export const EmblemGrid = ({ nfts, loading }) => {
  if (loading) {
    return <p className='poap-muted'>Carregant emblemes...</p>;
  }

  if (!nfts.length) {
    return <p className='poap-muted'>Encara no tens cap emblema.</p>;
  }

  return (
    <div className='poap-emblem-grid'>
      {nfts.map((nft) => {
        const imageUrl = nft.url ?? 'https://devnet-media.multiversx.com/nfts/thumbnail/default.png';
        const name = nft.name ?? 'Emblema';
        const claimedAt = getEmblemDate(nft.identifier);

        return (
          <article key={nft.identifier} className='poap-emblem-card'>
            <div className='poap-emblem-image'>
              <img src={imageUrl} alt={name} />
            </div>
            <p className='poap-emblem-name'>{name}</p>
            <p className='poap-emblem-date'>
              {claimedAt ? formatDate(claimedAt) : 'Data desconeguda'}
            </p>
          </article>
        );
      })}
    </div>
  );
};