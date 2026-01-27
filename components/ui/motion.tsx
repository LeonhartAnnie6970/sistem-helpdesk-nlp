"use client"

import { motion, HTMLMotionProps, Variants } from "framer-motion"
import { forwardRef } from "react"

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Default transition
export const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1]
}

// Motion components
interface MotionDivProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} {...props}>
      {children}
    </motion.div>
  )
)
MotionDiv.displayName = "MotionDiv"

// Animated Card wrapper
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
  delay?: number
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
AnimatedCard.displayName = "AnimatedCard"

// Animated List container
interface AnimatedListProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

export const AnimatedList = forwardRef<HTMLDivElement, AnimatedListProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
)
AnimatedList.displayName = "AnimatedList"

// Animated List Item
interface AnimatedListItemProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

export const AnimatedListItem = forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItem}
      transition={defaultTransition}
      {...props}
    >
      {children}
    </motion.div>
  )
)
AnimatedListItem.displayName = "AnimatedListItem"

// Page transition wrapper
interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
PageTransition.displayName = "PageTransition"

// Hover scale effect
interface HoverScaleProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
  scale?: number
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.02, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
HoverScale.displayName = "HoverScale"

// Pulse animation (for notifications)
export const PulseAnimation = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
PulseAnimation.displayName = "PulseAnimation"

// Slide in from side
interface SlideInProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = "left", ...props }, ref) => {
    const variants = {
      left: fadeInLeft,
      right: fadeInRight,
      up: fadeInUp,
      down: fadeInDown
    }

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants[direction]}
        transition={defaultTransition}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
SlideIn.displayName = "SlideIn"
