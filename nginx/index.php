<?php
if (isset($_GET['ip'])) {
    $ip = htmlspecialchars($_GET['ip']);
    header("Location: steam://connect/$ip");
    exit();
} else {
    echo "IP parameter is missing.";
}
?>
