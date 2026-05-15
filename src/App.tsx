import GameCanvas from "./ui/GameCanvas";
import GameOverScreen from "./ui/GameOverScreen";
import HUD from "./ui/hud/HUD";
import LoadingScreen from "./ui/LoadingScreen";
import StartScreen from "./ui/StartScreen";
import "./App.css";

export default function App() {
	return (
		<div className="app">
			<LoadingScreen />
			<StartScreen />
			<GameCanvas />
			<HUD />
			<GameOverScreen />
		</div>
	);
}
