export interface PantryItem {
  id: string;
  name: string;
  category: 'fridge' | 'freezer' | 'pantry';
  foodGroup?: string; // e.g. Produce, Dairy, Meat, Bakery, Grains, Canned
  quantity: string;
  addedDate: string;
  expiryDate: string;
  cost: number; // approximate store cost for stats
  status: 'active' | 'consumed' | 'wasted';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  ingredients: {
    name: string;
    amount: string;
    inPantry: boolean;
  }[];
  instructions: string[];
  tips?: string[];
  savingAmount: number; // calculated savings
}

export interface GroceryItem {
  id: string;
  name: string;
  category: 'fridge' | 'freezer' | 'pantry';
  quantity: string;
  estimatedPrice: number;
  completed: boolean;
  autoAdded?: boolean;
}

export interface FamilyProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface SavingStats {
  moneySaved: number;
  moneyWasted: number;
  itemsSavedCount: number;
  itemsWastedCount: number;
  wasteReductionRate: number; // percent string or number
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ScannedItemResponse {
  name: string;
  category: 'fridge' | 'freezer' | 'pantry';
  quantity: string;
  expiryDays: number;
  estimatedCost: number;
}
