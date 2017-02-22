echo "--------------------Electron build tool--------------------"
echo -e "| \e[0;32m  1. All \e[0m						  |"
echo -e "| \e[0;32m  2. Windows \e[0m						  |"
echo -e "| \e[0;32m  3. Linux \e[0m						  |"
echo -e "| \e[0;32m  4. MacOS \e[0m						  |"
echo "-----------------------------------------------------------"
echo -n "Please choose the platform do you want to build: "
read platform

echo -n "Please type the version: "
read version

case "$platform" in
	1) electron-packager ./ 'S.A.P - Simple Audio Player' --platform=all --out ./build --version "$version";;
	2) electron-packager ./ 'S.A.P - Simple Audio Player' --platform=win32 --out ./build --version "$version";;
	3) electron-packager ./ 'S.A.P - Simple Audio Player' --platform=linux --out ./build --version "$version";;
	4) electron-packager ./ 'S.A.P - Simple Audio Player' --platform=darwin --out ./build --version "$version";;
esac
