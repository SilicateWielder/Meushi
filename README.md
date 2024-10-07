# Meushi! V0.1.3

A smart Minecraft bot with personality.

## Overview

The goal of this project is to create an intelligent Minecraft bot that leverages Small Language Models (SLMs) to assist users in ways not possible with typical solutions. This will be achieved through the implementation of an autonomous agent algorithm, enabling Meushi to:

- **Think** and make decisions autonomously.
- Determine **what actions** to take, along with **how** to execute them.
- Utilize chain-of-thought as the primary driver for decision-making processes.

By combining these capabilities the goal is to create a bot that can be interacted with naturally, is capable of learning and self-regulating, and can maintain situational awareness.

The project currently relies on Mistral-Nemo to function, with RAG functionality based on a hybrid SQLite + Vector db approach. While this works in it's current form I want to fine-tune models to reduce the number of rules that are needed to make the bot functional.

## Why not use the cloud?

For three reasons: 
1. OpenAI's APIs takes the fun out of this. 
2. It seems like the more ecologically responsible approach. LLMs are much more resource hungry than SLMs for the same speed.
3. I feel my best work is often done with constraints.

As such, my goal here is to focus on reigning in the system requirements as much as possible. Using energy efficient equipment where I can afford to, and what would otherwise be e-waste elsewhere. 

## Why the cow theme?

Cows are cool. I'll leave you to your imagination beyond that.

## Current Development System Specs
The development system is virtualized.
- CPU: 4 cores
- RAM: 4GB
- GPU: Tesla M40 24GB (A 12GB card does currently work, but the vram requirement may grow over time)
- Storage: 120GB

## Core Dependencies
 - Simple-terminal (Also written by me, it will be replaced with a more sophisticated hand-rolled UI)
 - Node-FAISS (Bindings for Facebook's FAISS library)
 - Ollama package for mpm + Ollama 0.3.9 w/ Mistral-nemo, Llama3.2:1b, nomic-embed-text
 - Mineflayer
 - Prismarine Viewer
 - Mc-Data
 - Simple-Sqlite3

## Architecture

 Because I think it's neat, I've chosen to adopt a modular architecture. This also helps my final, feeble braincell digest what I'm looking at.

 The system is split into two main parts: The core which is persistently loaded, and packages. Packages can be dynamically loaded/unloaded/reloaded to aid in debugging without killing and restarting the bot. While it isn't perfect, it does let me quickly test and debug; I'm still working out the bugs with this.


## Project State

 It's a dumpster fire. Hopefully I can slow the burn so I don't freeze this winter.

 ## Contribution

 I may eventually accept contributions to the project, but for now I want to focus on cleaning things up, and refining the core APIs. Components will be added over time as I trim the fat so-to-speak.

## Changes
 - Replaced simle-terminal with a termvas.
 - Implemented hand-rolled UI using termvas (It's awful).
 - Modified brain DB to retrieve memory in a more sequential context.
 - Seperated event logic within meushi.js
 - Fixed relogging in the event of being kicked.
 - Implemented periodic advertising.
 - Altered message handling to instead use the chat event instead of message event.
 
