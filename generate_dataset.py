#!/usr/bin/env python3
"""
Generate 10,000 Innovation Idea Records for AI Idea Similarity Detector

This script generates a comprehensive dataset of innovation ideas across
multiple categories with realistic descriptions, impact scores, and keywords.
"""

import json
import random
from datetime import datetime
from typing import Dict, List, Any

# Category definitions with keywords
CATEGORIES = {
    "AI": {
        "keywords": ["machine learning", "neural networks", "deep learning", "natural language processing", 
                    "computer vision", "predictive analytics", "automation", "cognitive computing",
                    "algorithm", "intelligent systems", "pattern recognition", "data mining",
                    "reinforcement learning", "generative AI", "expert systems"],
        "prefixes": ["Autonomous", "Intelligent", "Adaptive", "Cognitive", "Predictive", "Neural", "Smart"],
        "suffixes": ["Engine", "Platform", "System", "Network", "Framework", "Analyzer", "Optimizer"]
    },
    "Healthcare": {
        "keywords": ["diagnostic", "therapeutic", "preventive care", "medical imaging", "biotech",
                    "precision medicine", "telemedicine", "wearable sensors", "genomics", "proteomics",
                    "drug discovery", "clinical trials", "patient monitoring", "surgical robotics",
                    "regenerative medicine", "immunotherapy"],
        "prefixes": ["Bio", "Med", "Health", "Care", "Life", "Cure", "Vital", "Pulse"],
        "suffixes": ["Scanner", "Monitor", "Therapy", "Diagnostic", "Treatment", "Platform", "Device"]
    },
    "Energy": {
        "keywords": ["renewable", "solar", "wind", "hydroelectric", "geothermal", "nuclear fusion",
                    "battery storage", "smart grid", "energy efficiency", "carbon capture",
                    "hydrogen fuel", "biofuel", "thermal", "photovoltaic", "turbine"],
        "prefixes": ["Eco", "Green", "Power", "Solar", "Wind", "Hydro", "Nuclear", "Clean"],
        "suffixes": ["Generator", "Storage", "Cell", "Panel", "Turbine", "Grid", "System"]
    },
    "Transportation": {
        "keywords": ["electric vehicle", "autonomous driving", "hyperloop", "maglev", "drone delivery",
                    "urban mobility", "logistics optimization", "traffic management", "shared mobility",
                    "aerial taxi", "smart highway", "rail transport", "marine transport", "aviation"],
        "prefixes": ["Auto", "Trans", "Move", "Speed", "Fleet", "Urban", "Smart", "Green"],
        "suffixes": ["Vehicle", "Pod", "Drone", "Shuttle", "System", "Network", "Hub"]
    },
    "Robotics": {
        "keywords": ["humanoid", "industrial automation", "collaborative robots", "swarm robotics",
                    "soft robotics", "exoskeleton", "prosthetics", "surgical robots", "drones",
                    "underwater robots", "space robots", "nanobots", "manipulator", "actuator"],
        "prefixes": ["Robo", "Mech", "Auto", "Cyber", "Bio", "Nano", "Smart", "Flex"],
        "suffixes": ["Bot", "Droid", "Arm", "Walker", "Companion", "Worker", "Surgeon"]
    },
    "Agriculture": {
        "keywords": ["precision farming", "vertical farming", "hydroponics", "aquaponics", "drones",
                    "livestock monitoring", "crop optimization", "soil sensors", "autonomous tractor",
                    "greenhouse automation", "sustainable farming", "genetic crops", "irrigation"],
        "prefixes": ["Agri", "Farm", "Crop", "Grow", "Eco", "Smart", "Bio", "Green"],
        "suffixes": ["Harvester", "Monitor", "Drone", "System", "Sensor", "Optimizer", "Bot"]
    },
    "Space": {
        "keywords": ["satellite", "rocket", "space station", "lunar base", "mars colony",
                    "asteroid mining", "space tourism", "orbital manufacturing", "telescope",
                    "space debris removal", "propulsion", "life support", "space suit", "reentry"],
        "prefixes": ["Astro", "Cosmo", "Star", "Lunar", "Mars", "Orbital", "Space", "Galactic"],
        "suffixes": ["Craft", "Station", "Base", "Rover", "Probe", "Ship", "Port"]
    },
    "Education": {
        "keywords": ["e-learning", "adaptive learning", "virtual classroom", "gamification",
                    "AI tutor", "skill assessment", "personalized curriculum", "VR training",
                    "MOOC", "language learning", "STEM education", "remote education", "assessment"],
        "prefixes": ["Edu", "Learn", "Smart", "Virtual", "Digital", "Global", "Open", "Skill"],
        "suffixes": ["Platform", "Academy", "Tutor", "Lab", "Classroom", "Hub", "Portal"]
    },
    "Environment": {
        "keywords": ["climate monitoring", "pollution control", "waste management", "water purification",
                    "air quality", "reforestation", "ocean cleanup", "biodiversity", "ecosystem",
                    "carbon neutral", "sustainable", "recycling", "conservation", "restoration"],
        "prefixes": ["Eco", "Green", "Clean", "Earth", "Ocean", "Bio", "Nature", "Pure"],
        "suffixes": ["Guardian", "Monitor", "Purifier", "System", "Restorer", "Shield", "Net"]
    },
    "Cybersecurity": {
        "keywords": ["encryption", "firewall", "threat detection", "intrusion prevention",
                    "zero trust", "blockchain security", "biometric auth", "quantum cryptography",
                    "malware analysis", "penetration testing", "security audit", "identity management",
                    "data privacy", "secure communication"],
        "prefixes": ["Cyber", "Secur", "Shield", "Crypto", "Guard", "Lock", "Safe", "Vault"],
        "suffixes": ["Wall", "Guard", "Shield", "Lock", "Vault", "Sentinel", "Protector"]
    }
}

# Innovation concept templates for each category
CONCEPT_TEMPLATES = {
    "AI": [
        "A {prefix} {suffix} that uses {keyword1} to analyze {keyword2} patterns and predict outcomes with {impact}% accuracy",
        "An intelligent {suffix} powered by {keyword1} for automated {keyword2} in real-time environments",
        "A cognitive computing platform combining {keyword1} and {keyword2} for enterprise decision support",
        "A neural {suffix} that learns from {keyword1} data to optimize {keyword2} workflows",
        "An adaptive {suffix} leveraging {keyword1} algorithms to enhance {keyword2} capabilities"
    ],
    "Healthcare": [
        "A {prefix} {suffix} utilizing {keyword1} technology for early detection of diseases through {keyword2}",
        "A portable {suffix} that monitors {keyword1} biomarkers and provides {keyword2} recommendations",
        "A revolutionary {suffix} combining {keyword1} and {keyword2} for personalized treatment plans",
        "An AI-powered {suffix} for {keyword1} analysis with integrated {keyword2} feedback systems",
        "A minimally invasive {suffix} using {keyword1} for precise {keyword2} interventions"
    ],
    "Energy": [
        "A {prefix} {suffix} that harnesses {keyword1} to generate {keyword2} with 40% higher efficiency",
        "An advanced {suffix} storing {keyword1} in {keyword2} cells for grid-scale applications",
        "A distributed {suffix} network using {keyword1} to optimize {keyword2} consumption",
        "A hybrid {suffix} combining {keyword1} and {keyword2} technologies for baseload power",
        "A smart {suffix} management system for {keyword1} with predictive {keyword2} analytics"
    ],
    "Transportation": [
        "A {prefix} {suffix} enabling {keyword1} through advanced {keyword2} navigation systems",
        "An electric {suffix} with {keyword1} capabilities and autonomous {keyword2} features",
        "A high-speed {suffix} using {keyword1} propulsion for intercity {keyword2}",
        "A shared {suffix} platform optimizing {keyword1} routes through {keyword2} algorithms",
        "An aerial {suffix} for urban {keyword1} with vertical takeoff {keyword2} systems"
    ],
    "Robotics": [
        "A {prefix} {suffix} capable of {keyword1} tasks with human-like {keyword2} precision",
        "An autonomous {suffix} performing {keyword1} operations in hazardous {keyword2} environments",
        "A collaborative {suffix} assisting humans with {keyword1} through intuitive {keyword2} interfaces",
        "A swarm of micro-{suffix} units for distributed {keyword1} and coordinated {keyword2}",
        "A soft {suffix} using flexible {keyword1} actuators for delicate {keyword2} manipulation"
    ],
    "Agriculture": [
        "A {prefix} {suffix} monitoring {keyword1} conditions to optimize {keyword2} yields",
        "An autonomous {suffix} performing {keyword1} tasks with AI-driven {keyword2} decisions",
        "A vertical {suffix} system for urban {keyword1} using hydroponic {keyword2} methods",
        "A drone-based {suffix} for aerial {keyword1} assessment and targeted {keyword2} application",
        "A sensor network {suffix} predicting {keyword1} needs through {keyword2} analytics"
    ],
    "Space": [
        "A {prefix} {suffix} for sustainable {keyword1} operations in deep {keyword2} environments",
        "An inflatable {suffix} providing {keyword1} habitats for long-duration {keyword2} missions",
        "A nuclear-powered {suffix} enabling rapid {keyword1} transit between {keyword2} destinations",
        "A robotic {suffix} system for autonomous {keyword1} mining on {keyword2} surfaces",
        "A modular {suffix} supporting {keyword1} manufacturing in {keyword2} orbits"
    ],
    "Education": [
        "A {prefix} {suffix} delivering personalized {keyword1} through adaptive {keyword2} pathways",
        "An immersive {suffix} using VR for experiential {keyword1} in virtual {keyword2} labs",
        "An AI tutor {suffix} providing real-time {keyword1} feedback on {keyword2} performance",
        "A gamified {suffix} platform making {keyword1} engaging through interactive {keyword2}",
        "A collaborative {suffix} connecting learners globally for peer-to-peer {keyword1} and {keyword2}"
    ],
    "Environment": [
        "A {prefix} {suffix} removing {keyword1} from oceans using autonomous {keyword2} systems",
        "A bio-engineered {suffix} for rapid {keyword1} restoration and {keyword2} enhancement",
        "A network of {suffix} sensors monitoring {keyword1} quality with predictive {keyword2} alerts",
        "An atmospheric {suffix} capturing {keyword1} emissions through advanced {keyword2} filtration",
        "A sustainable {suffix} converting {keyword1} waste into valuable {keyword2} resources"
    ],
    "Cybersecurity": [
        "A {prefix} {suffix} using {keyword1} for real-time {keyword2} threat neutralization",
        "A quantum-resistant {suffix} protecting {keyword1} with lattice-based {keyword2} algorithms",
        "A behavioral {suffix} detecting {keyword1} anomalies through AI-powered {keyword2} analysis",
        "A decentralized {suffix} securing {keyword1} transactions via blockchain {keyword2}",
        "A biometric {suffix} replacing passwords with {keyword1} and behavioral {keyword2} patterns"
    ]
}

def generate_idea_name(category: str, used_names: set) -> str:
    """Generate a unique idea name for the given category."""
    cat_data = CATEGORIES[category]
    max_attempts = 100
    
    for _ in range(max_attempts):
        prefix = random.choice(cat_data["prefixes"])
        suffix = random.choice(cat_data["suffixes"])
        
        # Add variation
        if random.random() < 0.3:
            connectors = ["X", "Pro", "Max", "Ultra", "Neo", "Core", "Hub"]
            connector = random.choice(connectors)
            name = f"{prefix}{connector} {suffix}"
        elif random.random() < 0.2:
            name = f"{prefix} {suffix} {random.randint(1, 999)}"
        else:
            name = f"{prefix} {suffix}"
        
        if name not in used_names:
            used_names.add(name)
            return name
    
    # Fallback with unique timestamp-based name
    return f"{prefix} {suffix} {random.randint(1000, 99999)}"


def generate_description(category: str) -> str:
    """Generate a realistic innovation description."""
    cat_data = CATEGORIES[category]
    templates = CONCEPT_TEMPLATES[category]
    
    template = random.choice(templates)
    keyword1 = random.choice(cat_data["keywords"])
    keyword2 = random.choice(cat_data["keywords"])
    
    # Ensure different keywords
    while keyword2 == keyword1:
        keyword2 = random.choice(cat_data["keywords"])
    
    prefix = random.choice(cat_data["prefixes"])
    suffix = random.choice(cat_data["suffixes"])
    impact = random.randint(85, 99)
    
    description = template.format(
        prefix=prefix,
        suffix=suffix.lower(),
        keyword1=keyword1,
        keyword2=keyword2,
        impact=impact
    )
    
    return description


def generate_keywords(category: str) -> List[str]:
    """Generate 3-6 relevant keywords for the idea."""
    cat_data = CATEGORIES[category]
    num_keywords = random.randint(3, 6)
    
    # Always include at least one category-specific keyword
    base_keywords = random.sample(cat_data["keywords"], min(num_keywords, len(cat_data["keywords"])))
    
    # Add some generic innovation keywords
    generic = ["breakthrough", "sustainable", "scalable", "efficient", "smart", "connected", 
               "automated", "intelligent", "innovative", "disruptive", "green", "digital"]
    
    additional = random.sample(generic, random.randint(1, 3))
    
    keywords = list(set(base_keywords + additional))
    return keywords[:6]  # Max 6 keywords


def generate_record(record_id: int, used_names: set) -> Dict[str, Any]:
    """Generate a single innovation record."""
    category = random.choice(list(CATEGORIES.keys()))
    
    # Weight years toward more recent innovations
    year_weights = []
    for year in range(1900, 2036):
        if year < 1950:
            weight = 1
        elif year < 2000:
            weight = 3
        elif year < 2020:
            weight = 5
        else:
            weight = 8
        year_weights.extend([year] * weight)
    
    record = {
        "id": record_id,
        "idea_name": generate_idea_name(category, used_names),
        "description": generate_description(category),
        "category": category,
        "innovation_year": random.choice(year_weights),
        "impact_score": round(random.uniform(50.0, 100.0), 1),
        "keywords": generate_keywords(category)
    }
    
    return record


def generate_dataset(count: int = 10000) -> List[Dict[str, Any]]:
    """Generate the complete dataset."""
    used_names = set()
    dataset = []
    
    print(f"Generating {count} innovation records...")
    
    for i in range(1, count + 1):
        record = generate_record(i, used_names)
        dataset.append(record)
        
        if i % 1000 == 0:
            print(f"  Generated {i} records...")
    
    return dataset


def save_dataset(dataset: List[Dict[str, Any]], filename: str = "innovation_dataset_10000.json"):
    """Save the dataset to a JSON file."""
    output = {
        "metadata": {
            "total_records": len(dataset),
            "generated_at": datetime.now().isoformat(),
            "categories": list(CATEGORIES.keys()),
            "version": "1.0"
        },
        "records": dataset
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nDataset saved to: {filename}")
    print(f"Total records: {len(dataset)}")
    
    # Print category distribution
    category_counts = {}
    for record in dataset:
        cat = record["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print("\nCategory Distribution:")
    for cat, count in sorted(category_counts.items()):
        percentage = (count / len(dataset)) * 100
        print(f"  {cat}: {count} ({percentage:.1f}%)")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Innovation Dataset Generator")
    print("=" * 60)
    print()
    
    # Generate dataset
    dataset = generate_dataset(10000)
    
    # Save to file
    save_dataset(dataset)
    
    # Show sample records
    print("\n" + "=" * 60)
    print("Sample Records:")
    print("=" * 60)
    
    for i, record in enumerate(dataset[:3], 1):
        print(f"\nRecord #{record['id']}:")
        print(f"  Name: {record['idea_name']}")
        print(f"  Category: {record['category']}")
        print(f"  Year: {record['innovation_year']}")
        print(f"  Impact Score: {record['impact_score']}")
        print(f"  Keywords: {', '.join(record['keywords'])}")
        print(f"  Description: {record['description'][:100]}...")
    
    print("\n" + "=" * 60)
    print("Generation Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
