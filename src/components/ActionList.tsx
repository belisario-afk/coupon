import React from 'react';
import DealCard from './DealCard';
import { DealEvaluation } from '../models/types';

interface Props {
  evaluations: DealEvaluation[];
}

const ActionList: React.FC<Props> = ({ evaluations }) => {
  if (evaluations.length === 0) return <p>No evaluated offers yet.</p>;
  return (
    <div className="grid">
      {evaluations.map(ev => (
        <DealCard key={ev.offer.id + ev.staple.id} eval={ev} />
      ))}
    </div>
  );
};

export default ActionList;