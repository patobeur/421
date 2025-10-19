🎲 Prompt HTML / Three.js / Cannon-es – Dé 6 faces avec physique réaliste

    Crée une page HTML avec 3 dés à 6 faces (type D6) en 3D utilisant Three.js et Cannon-es.

    Fonctionnalités souhaitées :

        Le dés sont lancés dans la scène comme s'il etait jeté par l'utilisateur(trice) avec une rotation aléatoire depuis une certaine hauteur (réglable).

        les dés rebondissent sur un sol physique, puis finissent par s’arrêter naturellement grâce à la physique. Une sphere semi-invisible empeche les dés de sortir de la vue du joueur. (en prod la sphere sera invisible, les des pourront entrer dedans mais pas en sortir)

        Une fois que le dés sont immobiles, leur valeur (face du dessus) est affichée à l'écran du plus grand au plus petit.

    Contraintes techniques :

        Utiliser three.module.js pour la 3D.

        Utiliser cannon-es pour la physique.

        Avoir un fichier main.js importé via <script type="module">.

        Le projet utilise des fichiers séparés pour chaque logique.

        Le mouvement doit être fluide et réaliste, avec collisions et rebonds.

        Le code doit utiliser la méthode Quaternion ou la matrice de rotation pour déterminer la face supérieure une fois le dé stabilisé.

🎲 annexes

    pour le index.html (mettre à jour avec les dernieres versions le cas écheant)

    ```bash
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

    et ceci pour le debut des fichiers .js (mettre à jour avec les dernieres versions le cas écheant)

    ```bash
    import _ as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import _ as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
    ```
