import { formatDate } from '@/utils/dates';

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
        const imageUrl = nft.media?.[0]?.url ?? nft.url ?? '';
        const name = nft.name ?? 'Emblema';
        // Devnet API returns timestamp already in milliseconds
        const timestamp = nft.timestamp ? Number(nft.timestamp) : null;

        return (
          <article key={nft.identifier} className='poap-emblem-card'>
            <div className='poap-emblem-image'>
              {imageUrl ? (
                <img src={imageUrl} alt={name} />
              ) : (
                <div className='poap-emblem-placeholder'>🏅</div>
              )}
            </div>
            <p className='poap-emblem-name'>{name}</p>
            <p className='poap-emblem-date'>{formatDate(timestamp)}</p>
          </article>
        );
      })}
    </div>
  );
};