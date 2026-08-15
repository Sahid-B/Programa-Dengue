import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { X } from 'lucide-react';

export default function ExpandableBentoGrid({ items }) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bento-overlay"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <div className="bento-modal-wrapper">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="bento-modal-card"
            >
              <motion.button
                key={`button-close-${active.title}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="bento-close-btn"
                onClick={() => setActive(null)}
                title="Cerrar"
              >
                <X size={16} />
              </motion.button>

              <motion.div layoutId={`image-${active.title}-${id}`}>
                <div className="bento-modal-header-icon">
                  {active.icon ? (
                    <div className="scale-icon">{active.icon}</div>
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
              </motion.div>

              <div className="bento-modal-body">
                <div className="bento-modal-title-row">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="bento-modal-title"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.title}-${id}`}
                      className="bento-modal-subtitle"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  {active.visitLink && (
                    <motion.a
                      layoutId={`button-${active.title}-${id}`}
                      href={active.visitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bento-modal-visit-btn"
                    >
                      Ver
                    </motion.a>
                  )}
                </div>

                <div className="bento-modal-content-area">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <ul className="bento-grid">
        {items.map((item) => (
          <motion.div
            layoutId={`card-${item.title}-${id}`}
            key={item.id}
            onClick={() => setActive(item)}
            className="bento-card-item"
          >
            <div className="bento-card-item-left">
              <motion.div layoutId={`image-${item.title}-${id}`}>
                <div className="bento-card-icon-wrapper">
                  {item.icon}
                </div>
              </motion.div>
              <div>
                <motion.h3
                  layoutId={`title-${item.title}-${id}`}
                  className="bento-card-title"
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${item.title}-${id}`}
                  className="bento-card-subtitle"
                >
                  {item.subtitle}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}
