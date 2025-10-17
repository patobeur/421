🎲 Prompt HTML / Three.js / Cannon-es – Dé 6 faces avec physique réaliste

    Crée une page HTML avec un dé à 6 faces (type D6) en 3D utilisant Three.js et Cannon-es.

    Fonctionnalités souhaitées :

        Le dé tombe dans la scène avec une rotation aléatoire depuis une certaine hauteur (réglable).

        Il rebondit sur un sol physique, puis finit par s’arrêter naturellement grâce à la physique (4 murs invisibles enmpeche les des de sortir du rond central).

        Une fois que le dé est immobile, sa valeur (face du dessus) est affichée dans la console ou sur l'écran.

    Contraintes techniques :

        Utiliser three.module.js pour la 3D.

        Utiliser cannon-es pour la physique.

        Avoir un fichier main.js importé via <script type="module">.

        Le projet utilise des fichiers séparés :

            threefunctions.js pour la scène, lumière, caméra, etc.

            gamefunctions.js pour la logique de partie.

            dicemanager.js pour tout ce qui concerne les dés (création, animation, calcul face supérieure).

        Le dé peut être un cube texturé ou coloré, chaque face numérotée (1 à 6).

        Le mouvement doit être fluide et réaliste, avec collisions et rebonds.

        Le code doit utiliser la méthode Quaternion ou la matrice de rotation pour déterminer la face supérieure une fois le dé stabilisé.

🎲 annexes

    pour le index.html

    ```
    	<script
    		async
    		src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
    	<script type="importmap">
    		{
    			"imports": {
    				"three": "https://unpkg.com/three@0.176.0/build/three.module.js",
    				"three/addons/": "https://unpkg.com/three@0.176.0/examples/jsm/"
    			}
    		}
    	</script>
    	<script type="module" src="js/main.js"></script>
    ```

    et ceci pour le debut des fichiers .js

    ```

    import _ as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import _ as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
    // ---------------------------------
    import { ??? } from "/js/threefunctions.js"; //<--- ici toutes les fonctions 3d
    import { ??? } from "/js/gamefunctions.js"; //<--- ici toutes les fonctions du jeu
    import { ??? } from "/js/dicemanager.js"; //<--- ici toutes les fonctions pour connaitres la position finale du dé et la face supérieur
    ```
