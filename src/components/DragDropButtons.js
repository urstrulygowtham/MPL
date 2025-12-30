import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTrophy,
  FaImages,
  FaHandshake,
  FaPhone,
  FaStar,
  FaHistory,
  FaAward
} from 'react-icons/fa';

const ButtonItem = ({ icon, label, path, index, moveButton }) => {
  const navigate = useNavigate();
  const [, ref] = useDrag({
    type: 'button',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'button',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveButton(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => ref(drop(node))}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="draggable-item flex flex-col items-center justify-center p-6 cursor-move"
      onClick={() => navigate(path)}
    >
      <div className="text-4xl text-mpl-accent mb-3">{icon}</div>
      <span className="font-semibold text-center">{label}</span>
    </motion.div>
  );
};

const DragDropButtons = () => {
  const [buttons, setButtons] = useState([
    { icon: <FaTrophy />, label: 'Winners List', path: '/winners' },
    { icon: <FaHistory />, label: 'All Seasons', path: '/winners#all-seasons' },
    { icon: <FaImages />, label: 'Photo Gallery', path: '/gallery' },
    { icon: <FaHandshake />, label: 'Title Sponsor', path: '/sponsors#title' },
    { icon: <FaAward />, label: 'Prize Sponsors', path: '/sponsors#prizes' },
    { icon: <FaStar />, label: 'Match Awards', path: '/sponsors#awards' },
    { icon: <FaPhone />, label: 'Contact Organizers', path: '/contact' },
  ]);

  const moveButton = (fromIndex, toIndex) => {
    const updatedButtons = [...buttons];
    const [movedButton] = updatedButtons.splice(fromIndex, 1);
    updatedButtons.splice(toIndex, 0, movedButton);
    setButtons(updatedButtons);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {buttons.map((button, index) => (
        <ButtonItem
          key={index}
          index={index}
          {...button}
          moveButton={moveButton}
        />
      ))}
    </div>
  );
};

export default DragDropButtons;