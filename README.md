# Credit-Card-Fraud-Detection


Credit Card Fraud Detection – Data Preprocessing
Dataset

Fichier: creditcard.csv

Objectif: Détecter les transactions frauduleuses (Class = 1)

Features: V1…V28 (PCA), Time, Amount, Class

Étapes de preprocessing

Chargement & exploration

Vérifier shape, null values, classes, doublons

Scaling

Amount → Amount_scaled, Time → Time_scaled

Supprimer colonnes originales

Split features/target

X = df.drop('Class'), y = df['Class']

Gestion du déséquilibre

SMOTE pour équilibrer classes

Train-Test Split

80% train / 20% test, stratify=y
